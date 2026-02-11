import { supabase } from "./auth.js";
import { cleanupExpired } from "./auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.style.display = "none";

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    errorMsg.innerText = "Invalid login credentials";
    errorMsg.style.display = "block";
    return;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, redirect_url")
      .eq("id", data.user.id)
      .single();

  if (profileError) {
    errorMsg.innerText = "Profile not found";
    errorMsg.style.display = "block";
    return;
  }

  if (profile.role === "admin") {
    window.location.href = "/admin.html";
  } else {
    window.location.href = "/user.html";
  }

});

/* =========================
   FRIEND LOGIN
========================= */

const friendBtn = document.getElementById("friendLoginBtn");

friendBtn.addEventListener("click", async () => {

  const friendPass =
    document.getElementById("friendPassword").value.trim();

  const errorMsg =
    document.getElementById("errorMsg");

  if (!friendPass) {
    alert("Enter friend password");
    return;
  }

  const requestedProfile =
    localStorage.getItem("requestedProfile");

  if (!requestedProfile) {
    alert("Invalid access path");
    return;
  }

  const hash = await hashPassword(friendPass);

  const { data, error } =
    await supabase
      .from("temp_friend_access")
      .select("*")
      .eq("owner_username", requestedProfile)
      .eq("password_hash", hash)
      .gt("expires_at", new Date().toISOString())
      .single();

  if (error || !data) {
    errorMsg.innerText =
      "Invalid or expired friend password";
    errorMsg.style.display = "block";
    return;
  }

  await cleanupExpired(supabase);

  const token = crypto.randomUUID();
  const tokenExpiry =
    new Date(Date.now() + 60 * 60 * 1000);

  await supabase
    .from("access_tokens")
    .insert({
      owner_username: requestedProfile,
      token: token,
      access_type: "friend",
      expires_at: tokenExpiry
    });

  window.location.href =
    "/u/" + requestedProfile + "?token=" + token;

});

/* =========================
   HASH FUNCTION
========================= */

async function hashPassword(pass) {
  const buffer =
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(pass)
    );

  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
