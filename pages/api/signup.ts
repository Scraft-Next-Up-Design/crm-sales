import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseSecretKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.body);
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password: hashedPassword,
    });
    const { user, session } = data;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ user, session });
  }
  catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }


}
