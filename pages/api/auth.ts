import { NextApiRequest, NextApiResponse } from "next";
// import { supabase } from "../../lib/supabaseServer";
import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from '../../lib/supabaseClient'

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
        return res.status(400).json({ error: AUTH_MESSAGES.SIGNUP_FAILED });
      }

      const { email, password }: AuthRequestBody = body;

      switch (action) {
        case "signup": {
          if (!email || !password) {
            return res.status(400).json({ error: AUTH_MESSAGES.SIGNUP_FAILED });
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res
            .status(200)
            .json({ user: data.user, message: AUTH_MESSAGES.SIGNUP_SUCCESS });
        }

        case "signin": {
          if (!email || !password) {
            return res.status(400).json({ error: AUTH_MESSAGES.LOGIN_FAILED });
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
console.log(data)
          if (error) {
            return res.status(400).json({ error: error.message });
          }
          await supabase.auth.setSession(data.session);

          return res
            .status(200)
            .json({ user: data.user, message: AUTH_MESSAGES.LOGIN_SUCCESS });
        }

        case "signout": {
          const { error } = await supabase.auth.signOut();

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res
            .status(200)
            .json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS });
        }
        case "verify": {
          const token = req.headers.authorization?.split("Bearer ")[1]; // Extract token

          if (!token) {
            return res
              .status(401)
              .json({ error: AUTH_MESSAGES.INVALID_LOGIN_DATA });
          }

          try {
            const { data, error } = await supabase.auth.getUser(token);

            if (error) {
              return res
                .status(401)
                .json({ error: AUTH_MESSAGES.INVALID_LOGIN_DATA });
            }

            return res.status(200).json({ user: data });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error: AUTH_MESSAGES.API_ERROR });
          }
        }
        default:
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
    }

    default:
      return res.status(405).json({ error: AUTH_MESSAGES.API_ERROR });
  }
}
