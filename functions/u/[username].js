export async function onRequest(context) {
  const { username } = context.params;

  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Unauthorized - No token", { status: 401 });
  }

  // Verify token exists in database and not expired
  const verifyResponse = await fetch(
    `${context.env.SUPABASE_URL}/rest/v1/access_tokens?token=eq.${token}&owner_username=eq.${username}&expires_at=gt.${new Date().toISOString()}`,
    {
      headers: {
        apikey: context.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${context.env.SUPABASE_ANON_KEY}`
      }
    }
  );

  const tokenData = await verifyResponse.json();

  if (!tokenData || tokenData.length === 0) {
    return new Response("Unauthorized - Invalid or expired token", { status: 401 });
  }

  // Fetch external profile
  const externalUrl = `https://${username}.github.io/${username}.html`;

  try {
    const externalResponse = await fetch(externalUrl);

    if (!externalResponse.ok) {
      return new Response("Profile not found", { status: 404 });
    }

    const html = await externalResponse.text();

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error) {
    return new Response("Error loading profile", { status: 500 });
  }
}
