import { supabase } from "./auth.js";

let currentUserProfile = null;

// Load user profile
async function loadUser() {

  const { data: { user } } =
    await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

  if (!profile || profile.role !== "user") {
    window.location.href = "/login.html";
    return;
  }

  currentUserProfile = profile;

  document.getElementById("welcome")
    .innerText = `Welcome ${profile.username}`;

  loadFriendAccess();
}

loadUser();

async function loadFriendAccess() {

  const { data, error } =
    await supabase
      .from("temp_friend_access")
      .select("*")
      .eq("owner_username", currentUserProfile.username)
      .gt("expires_at", new Date().toISOString());

  const container =
    document.getElementById("friendAccessList");

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "No active friend access.";
    return;
  }

  data.forEach(item => {

    const expires =
      new Date(item.expires_at).toLocaleString();

    container.innerHTML += `
      <div style="margin-bottom:10px; padding:8px; border:1px solid #ccc;">
        Expires: ${expires}
        <br>
        <button onclick="revokeFriend('${item.id}')">
          Revoke
        </button>
      </div>
    `;
  });
}

/* =========================
   CREATE FRIEND PASSWORD
========================= */

document.getElementById("createFriendBtn")
.addEventListener("click", async () => {

  const password =
    document.getElementById("friendPass").value.trim();

  let hours =
    parseInt(document.getElementById("duration").value);

  if (!password) {
    alert("Enter password");
    return;
  }

  if (!hours || hours <= 0)
    hours = 6;

  const hash = await hashPassword(password);

  const expires =
    new Date(Date.now() + hours * 60 * 60 * 1000);

  const { error } =
    await supabase
      .from("temp_friend_access")
      .insert({
        owner_username: currentUserProfile.username,
        password_hash: hash,
        expires_at: expires
      });

  if (error) {
    alert("Error creating friend access");
    return;
  }

  alert(`Friend access created for ${hours} hours`);
});

/* =========================
   GO TO PROFILE
========================= */

document.getElementById("goProfileBtn")
.addEventListener("click", () => {
  window.location.href =
    "/u/" + currentUserProfile.username;
});

/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn")
.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
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

/* =========================
   CHANGE PASSWORD
========================= */

document
.getElementById("changePassBtn")
.addEventListener("click", async () => {

  const newPass =
    document.getElementById("newPassword").value.trim();

  if (!newPass || newPass.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  const { error } =
    await supabase.auth.updateUser({
      password: newPass
    });

  if (error) {
    alert("Error updating password");
    return;
  }

  alert("Password updated successfully 🎉");
});

window.revokeFriend = async function(id) {

  const { error } =
    await supabase
      .from("temp_friend_access")
      .delete()
      .eq("id", id);

  if (error) {
    alert("Error revoking access");
    return;
  }

  alert("Friend access revoked");
  loadFriendAccess();

};
