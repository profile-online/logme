export async function onRequest(context) {
  const { username } = context.params;

  const authHeader = context.request.headers.get("authorization");

  if (!authHeader) {
    return new Response("Unauthorized - No token", { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  // Verify token using Supabase
  const response = await fetch(
    `${context.env.SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: context.env.SUPABASE_ANON_KEY
      }
    }
  );

  if (!response.ok) {
    return new Response("Unauthorized - Invalid session", { status: 401 });
  }

  // If valid → fetch external profile
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
