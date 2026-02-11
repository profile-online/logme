// Import Supabase (ES Module)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Replace with your real values
const supabaseUrl = "https://wcnivkvdofnttueyoubr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjbml2a3Zkb2ZudHR1ZXlvdWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTk0MTAsImV4cCI6MjA4NjM3NTQxMH0.qVgfQDN7uOgwzx4WYW3CTUoek2I9rd4CmyB1JjOwv6k";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export async function cleanupExpired(supabase) {

  const now = new Date().toISOString();

  // Delete expired friend passwords
  await supabase
    .from("temp_friend_access")
    .delete()
    .lt("expires_at", now);

  // Delete expired access tokens
  await supabase
    .from("access_tokens")
    .delete()
    .lt("expires_at", now);

}