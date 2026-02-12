export async function onRequest(context) {
  const { username } = context.params;
  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");

  // =========================
  // REQUIRE TOKEN
  // =========================
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

  if (!tokenCheck.ok) {
    const errorText = await tokenCheck.text();
    return new Response(
      "Token validation failed: " + errorText,
      { status: 500 }
    );
  }

  const tokenData = await tokenCheck.json();

  if (!tokenData || tokenData.length === 0) {
    return new Response(
      "Unauthorized - Invalid or expired token",
      { status: 401 }
    );
  }

  // =========================
  // FETCH PROFILE REDIRECT URL
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

  if (!externalUrl) {
    return new Response("Redirect URL not configured", { status: 400 });
  }

  // =========================
  // FETCH EXTERNAL SITE
  // =========================
  try {
    const externalResponse = await fetch(externalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Cloudflare Worker Proxy)",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!externalResponse.ok) {
      return new Response(
        "Profile not reachable. Status: " + externalResponse.status,
        { status: 500 }
      );
    }

    const contentType = externalResponse.headers.get("Content-Type") || "text/html";
    const html = await externalResponse.text();

    return new Response(html, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return new Response(
      "Error loading profile: " + error.message,
      { status: 500 }
    );
  }
}
