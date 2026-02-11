export async function onRequest(context) {
  const { username } = context.params;

  // For now, simulate external profile using placeholder content
  const externalUrl = `https://${username}.github.io/${username}.html`;

  try {
    const response = await fetch(externalUrl);

    if (!response.ok) {
      return new Response("Profile not found", { status: 404 });
    }

    const html = await response.text();

    return new Response(html, {
      headers: {
        "Content-Type": "text/html"
      }
    });

  } catch (error) {
    return new Response("Error loading profile", { status: 500 });
  }
}
