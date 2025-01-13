import { NextApiRequest, NextApiResponse } from "next";
import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "../../lib/supabaseServer";

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

        case "acceptInvite": {
          try {
            const { email, workspaceId } = query;

            if (!email || !workspaceId) {
              return res
                .status(400)
                .json({ error: "Email and Workspace ID are required" });
            }

            // Fetch users
            const { data: userData, error: userError } =
              await supabase.auth.admin.listUsers();

            if (userError) {
              console.error("Error fetching users:", userError.message);
              return res.status(500).json({ error: "Failed to fetch users" });
            }

            const targetEmail = email;
            const matchingUsers = userData.users.filter(
              (user) => user.email === targetEmail
            );

            if (matchingUsers.length > 0) {
              console.log("Matching user(s) found:", matchingUsers);

              // Update workspace membership
              const { data: updateData, error: updateError } = await supabase
                .from("workspace_members")
                .update({ status: "accepted", user_id: matchingUsers[0]?.id })
                .eq("workspace_id", workspaceId)
                .eq("email", matchingUsers[0]?.email); // Assuming you have a variable `matchingEmail` that holds the email to match

              if (updateError) {
                console.error(
                  "Error updating workspace membership:",
                  updateError.message
                );
                return res
                  .status(500)
                  .json({ error: "Failed to update workspace membership" });
              }
              // res.redirect("/dashboard");
              return res
                .status(200)
                .json({ message: "Invite accepted successfully" });
            } else {
              // res.redirect("/signup");
              return res
                .status(404)
                .json({ error: "No user found with the provided email" });
            }
          } catch (error: any) {
            console.error("Unexpected error:", error.message);
            return res
              .status(500)
              .json({ error: "An unexpected error occurred" });
          }
        }

        case "signin": {
          if (!email || !password) {
            return res.status(400).json({ error: AUTH_MESSAGES.LOGIN_FAILED });
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          console.log(data);
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
