export async function onRequest(context) {
  return new Response(
    JSON.stringify({
      message: "Function is working!",
      supabaseUrlExists: !!context.env.SUPABASE_URL,
      anonKeyExists: !!context.env.SUPABASE_ANON_KEY
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}
