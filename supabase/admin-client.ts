import { createClient } from "@supabase/supabase-js";
import { Database } from "../src/types/supabase";

// Create admin client with service role key for bypassing RLS
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};
