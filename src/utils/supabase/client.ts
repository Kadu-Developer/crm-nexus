import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pusxexzzchylqwximzhe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0iVVwxx5vaIpNwH899tptg_0-X5mokQ';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
