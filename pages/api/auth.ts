import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

interface AuthRequestBody {
  email?: string;
  password?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req;
  const action = query.action as string;

  switch (method) {
    case "POST": {
      if (!action) {
        return res.status(400).json({ error: "Missing action parameter" });
      }

      const { email, password }: AuthRequestBody = body;

      switch (action) {
        case "signup": {
          if (!email || !password) {
            return res
              .status(400)
              .json({ error: "Email and password are required" });
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ user: data.user });
        }

        case "signin": {
          if (!email || !password) {
            return res
              .status(400)
              .json({ error: "Email and password are required" });
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          const { user } = data;

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ user });
        }

        case "signout": {
          const { error } = await supabase.auth.signOut();

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ message: "Signed out successfully" });
        }

        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
