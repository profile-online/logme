export async function onRequest(context) {
  const { username } = context.params;
  const request = context.request;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // =========================
  // FRIEND ACCESS
  // =========================
  if (token) {
    const tokenCheck = await fetch(
      `${context.env.SUPABASE_URL}/rest/v1/access_tokens?token=eq.${token}&owner_username=eq.${username}&expires_at=gt.${new Date().toISOString()}`,
      {
        headers: {
          apikey: context.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${context.env.SUPABASE_ANON_KEY}`
        }
      }
    );

    const tokenData = await tokenCheck.json();

    if (!tokenData || tokenData.length === 0) {
      return new Response("Unauthorized - Invalid or expired token", { status: 401 });
    }

  } else {

    // =========================
    // OWNER ACCESS
    // =========================

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const verifyUser = await fetch(
      `${context.env.SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: authHeader,
          apikey: context.env.SUPABASE_ANON_KEY
        }
      }
    );

    if (!verifyUser.ok) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userData = await verifyUser.json();

    // Check if logged-in user owns this profile
    const profileCheck = await fetch(
      `${context.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userData.id}&username=eq.${username}`,
      {
        headers: {
          apikey: context.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${context.env.SUPABASE_ANON_KEY}`
        }
      }
    );

    const profileData = await profileCheck.json();

    if (!profileData || profileData.length === 0) {
      return new Response("Unauthorized - Not owner", { status: 401 });
    }
  }

  // =========================
  // FETCH REDIRECT URL
  // =========================

  const profileFetch = await fetch(
    `${context.env.SUPABASE_URL}/rest/v1/profiles?username=eq.${username}&select=redirect_url`,
    {
      headers: {
        apikey: context.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${context.env.SUPABASE_ANON_KEY}`
      }
    }
  );

  const profileData = await profileFetch.json();

  if (!profileData || profileData.length === 0) {
    return new Response("Profile not found", { status: 404 });
  }

  const externalUrl = profileData[0].redirect_url;

  try {
    const externalResponse = await fetch(externalUrl);

    if (!externalResponse.ok) {
      return new Response("Profile not reachable", { status: 404 });
    }

    const html = await externalResponse.text();

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error) {
    return new Response("Error loading profile", { status: 500 });
  }
}
