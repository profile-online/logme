export async function onRequest(context) {
  const { username } = context.params;
  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Unauthorized - No token", { status: 401 });
  }

  // =========================
  // VALIDATE TOKEN
  // =========================

  const tokenCheck = await fetch(
    `${context.env.SUPABASE_URL}/rest/v1/access_tokens?token=eq.${token}&owner_username=eq.${username}&expires_at=gt.${new Date().toISOString()}`,
    {
      headers: {
        apikey: context.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${context.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  // If Supabase request fails completely
  if (!tokenCheck.ok) {
    const errorText = await tokenCheck.text();
    return new Response(
      "Token validation failed: " + errorText,
      { status: 500 }
    );
  }

  const tokenData = await tokenCheck.json();

  // If token not found or expired
  if (!tokenData || tokenData.length === 0) {
    return new Response(
      "Unauthorized - Invalid or expired token",
      { status: 401 }
    );
  }

  // =========================
  // FETCH PROFILE
  // =========================

  const profileFetch = await fetch(
    `${context.env.SUPABASE_URL}/rest/v1/profiles?username=eq.${username}&select=redirect_url`,
    {
      headers: {
        apikey: context.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${context.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!profileFetch.ok) {
    const errorText = await profileFetch.text();
    return new Response(
      "Profile lookup failed: " + errorText,
      { status: 500 }
    );
  }

  const profileData = await profileFetch.json();

  if (!profileData || profileData.length === 0) {
    return new Response("Profile not found", { status: 404 });
  }

  const externalUrl = profileData[0].redirect_url;

  // =========================
  // FETCH EXTERNAL PROFILE
  // =========================

  try {
    const externalResponse = await fetch(externalUrl);

    if (!externalResponse.ok) {
      return new Response(
        "Profile not reachable",
        { status: 404 }
      );
    }

    const html = await externalResponse.text();

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error) {
    return new Response(
      "Error loading profile",
      { status: 500 }
    );
  }
}
