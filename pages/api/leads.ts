import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseServer";
import Together from "together-ai";

// Initialize Together AI client
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const SYSTEM_PROMPT = `You are a JSON formatter. Format the input data into a JSON object with special handling for custom data. ONLY OUTPUT THE JSON OBJECT, NO OTHER TEXT.

Format Rules:
1. Extract name parts to first_name and last_name
2. Clean phone to digits and + only
3. Email to lowercase
4. For custom_data:
   - Convert underscore questions into readable format
   - Handle form fields as key-value pairs
   - Detect and format question-answer pairs
   - Maintain semantic meaning of fields
   - Group related questions together
5. Output format:
{
  "name": "",
  "email": "",
  "phone": "",
  "message": "",
  "custom_data": {
    "questions": {
      // Formatted questions here
    },
    // Other custom fields here
  }
}`;

function formatQuestionText(text: string): string {
  // Remove common prefixes
  text = text.replace(/^(what_is_|what_are_|how_|when_|where_|why_|who_)/, '');
  
  // Convert underscores to spaces and capitalize first letter
  text = text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Remove question mark if present and add it back consistently
  text = text.replace(/\?$/, '');
  if (!/[.!]$/.test(text)) {
    text += '?';
  }
  
  return text;
}

function processCustomData(data: any): Record<string, any> {
  const processed: Record<string, any> = {
    questions: {}
  };

  const isQuestionFormat = (key: string): boolean => {
    return /^(what_|how_|when_|where_|why_|who_|question_)/i.test(key) ||
           key.includes('_you_') ||
           key.endsWith('?') ||
           key.includes('looking_for');
  };

  const processQuestionAnswer = (key: string, value: any) => {
    const questionText = formatQuestionText(key);
    const questionKey = `question_${Object.keys(processed.questions).length}`;
    
    processed.questions[questionKey] = {
      question: questionText,
      answer: value,
      original_key: key
    };
  };

  const processValue = (key: string, value: any) => {
    if (Array.isArray(value)) {
      if (value.length === 2 && typeof value[0] === 'string' && isQuestionFormat(value[0])) {
        processQuestionAnswer(value[0], value[1]);
      } else {
        processed[key] = value;
      }
      return;
    }

    if (value && typeof value === 'object') {
      processed[key] = processCustomData(value);
      return;
    }

    if (isQuestionFormat(key)) {
      processQuestionAnswer(key, value);
    } else {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      processed[cleanKey] = value;
    }
  };

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (typeof item === 'object' && item.name && item.value) {
        processValue(item.name, item.value);
      } else {
        processValue(`item_${index}`, item);
      }
    });
  } else if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      processValue(key, value);
    });
  }

  if (Object.keys(processed.questions).length === 0) {
    delete processed.questions;
  }

  return processed;
}

const normalizeInput = (data: any): string => {
  if (data === null || data === undefined) {
    return "";
  }

  try {
    if (typeof data === "string") {
      return data;
    }
    return JSON.stringify(data);
  } catch (e) {
    return String(data);
  }
};

const isValidLead = (data: any): boolean => {
  if (!data) return false;

  const hasName = data.first_name || (data.custom_data && data.custom_data.name);
  const hasPhone = data.phone || (data.custom_data && data.custom_data.phone);

  return Boolean(hasName || hasPhone);
};

async function processWithAI(inputData: any) {
  try {
    const normalizedInput = normalizeInput(inputData);
    let formattedResponse = "";

    const response = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: normalizedInput,
        },
      ],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      temperature: 0,
      top_p: 1,
      top_k: 1,
      max_tokens: 500,
      stream: true,
    });

    for await (const token of response) {
      if (token.choices[0]?.delta?.content) {
        formattedResponse += token.choices[0].delta.content;
      }
    }

    const match = formattedResponse.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON found in AI response");
    }

    const parsedData = JSON.parse(match[0]);
    
    // Process custom data after AI formatting
    if (parsedData.custom_data) {
      parsedData.custom_data = processCustomData(parsedData.custom_data);
    }

    return parsedData;
  } catch (error) {
    console.error("AI processing error:", error);
    throw error;
  }
}

function fallbackProcess(data: any) {
  const processed: any = {
    name: "",
    email: "",
    phone: "",
    message: "",
    custom_data: {},
  };

  try {
    const inputData = typeof data === "string" ? JSON.parse(data) : data;
    
    if (Array.isArray(inputData)) {
      inputData.forEach((field) => {
        const value = String(field.value || "").trim();
        const name = String(field.name || "").toLowerCase();

        if (name.includes("name")) {
          const names = value.split(" ");
          processed.first_name = names[0] || "";
          processed.last_name = names.slice(1).join(" ") || "";
        } else if (name.includes("phone")) {
          processed.phone = value.replace(/[^0-9+]/g, "");
        } else if (name.includes("email")) {
          processed.email = value.toLowerCase();
        } else if (name.includes("message") || name.includes("comment")) {
          processed.message = value;
        } else {
          const customData = processCustomData({ [name]: value });
          processed.custom_data = { ...processed.custom_data, ...customData };
        }
      });
    } else if (typeof inputData === "object") {
      Object.entries(inputData).forEach(([key, value]) => {
        const processedValue = String(value || "").trim();
        const processedKey = key.toLowerCase();

        if (processedKey.includes("name")) {
          const names = processedValue.split(" ");
          processed.first_name = names[0] || "";
          processed.last_name = names.slice(1).join(" ") || "";
        } else if (processedKey.includes("phone")) {
          processed.phone = processedValue.replace(/[^0-9+]/g, "");
        } else if (processedKey.includes("email")) {
          processed.email = processedValue.toLowerCase();
        } else if (
          processedKey.includes("message") ||
          processedKey.includes("comment")
        ) {
          processed.message = processedValue;
        } else {
          const customData = processCustomData({ [key]: value });
          processed.custom_data = { ...processed.custom_data, ...customData };
        }
      });
    }

    return processed;
  } catch (error) {
    console.error("Fallback processing error:", error);
    return {
      name: "",
      email: "",
      phone: "",
      message: "",
      custom_data: { original_data: data },
    };
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query, headers } = req;
  const action = query.action as string;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const sourceWebhook = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/leads?action=${"getLeads"}&sourceId=${req.query.sourceId}&workspaceId=${
      req.query.workspaceId
    }`;
    const data = req.body;
    const customData = req.body.custom_data;
    if (!data) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Try AI processing first, fall back to manual if it fails
    let processedData;
    try {
      processedData = await processWithAI(data);
    } catch (error) {
      console.log("AI processing failed, using fallback");
      processedData = fallbackProcess(data);
    }

    // Merge any additional custom data
    if (customData) {
      processedData.custom_data = {
        ...processedData.custom_data,
        ...customData,
      };
    }

    // Validate the processed data
    if (!isValidLead(processedData)) {
      return res.status(400).json({
        error: "Invalid lead data",
        details: "Name or phone number is required",
        data: processedData,
      });
    }
    const { data: webhookMatch, error: webhookError } = await supabase
      .from("webhooks")
      .select("user_id,status")
      .eq("webhook_url", sourceWebhook)
      .single(); // `single()` ensures a single record is returned
    if (webhookError) {
      console.error("Error fetching webhook:", webhookError.message);
      throw new Error("Failed to fetch webhook details.");
    }
    if (!webhookMatch || webhookMatch.status !== true) {
      console.error("Webhook deactivated or not found.");
      throw new Error("Webhook deactivated.");
    }
    // Add metadata
    const leadData = {
      ...processedData,
      created_at: new Date().toISOString(),
      source: req.headers["origin"] || "unknown",
      lead_source_id: req.query.sourceId,
      user_id: webhookMatch?.user_id,
      contact_method: "Call",
      status: {
        name: "Arrived",
        color: "#FFA500",
      },
      work_id: req.query.workspaceId,
    };

    // Save to database
    const { data: savedData, error: dbError } = await supabase
      .from("leads")
      .insert([leadData])
      .select();

    if (dbError) throw dbError;

    return res.status(200).json({
      message: "Lead successfully saved",
      lead: savedData[0],
    });
  } catch (error: any) {
    console.error("Error processing lead:", error);
    return res.status(500).json({
      error: "Failed to process lead",
      details: error.message,
    });
  }
}
