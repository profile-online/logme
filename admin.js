import { supabase } from "./auth.js";

(async function () {

  const { data: { user } } =
    await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (!profile || profile.role !== "admin") {
    window.location.href = "/login.html";
    return;
  }

})();

const SUPABASE_URL = "https://wcnivkvdofnttueyoubr.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjbml2a3Zkb2ZudHR1ZXlvdWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc5OTQxMCwiZXhwIjoyMDg2Mzc1NDEwfQ.SsS9OOhR7UuNIwb0OKx8gyrQd_-HVIiK1UeSjCfH8rM";

const createBtn = document.getElementById("createUserBtn");
const loadBtn = document.getElementById("loadUsersBtn");
const userList = document.getElementById("userList");
const logoutBtn = document.getElementById("logoutBtn");

/* =========================
   CREATE USER
========================= */
createBtn.addEventListener("click", async () => {

  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const username = document.getElementById("newUsername").value.trim();
  const redirect = document.getElementById("newRedirect").value.trim();

  if (!email || !password || !username || !redirect) {
    alert("Fill all fields");
    return;
  }

  // ⚠️ TEMPORARY LOCAL DEV METHOD
  const response = await fetch(
    `${supabase.supabaseUrl}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert("Error creating user");
    console.log(data);
    return;
  }

  const userId = data.id;

  // Update profile with username + redirect
  await fetch(
    `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjbml2a3Zkb2ZudHR1ZXlvdWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc5OTQxMCwiZXhwIjoyMDg2Mzc1NDEwfQ.SsS9OOhR7UuNIwb0OKx8gyrQd_-HVIiK1UeSjCfH8rM",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjbml2a3Zkb2ZudHR1ZXlvdWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc5OTQxMCwiZXhwIjoyMDg2Mzc1NDEwfQ.SsS9OOhR7UuNIwb0OKx8gyrQd_-HVIiK1UeSjCfH8rM",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        username,
        redirect_url: redirect,
        role: "user"
      })
    }
  );

  alert("User created successfully 🎉");
});

/* =========================
   LOAD USERS
========================= */
loadBtn.addEventListener("click", async () => {

  const { data } =
    await supabase
      .from("profiles")
      .select("email, username, role, redirect_url");

  userList.innerHTML = "";

  data.forEach(user => {
  userList.innerHTML += `
    <div style="margin-bottom:15px; padding:10px; border:1px solid #ccc;">
      <strong>Email:</strong> ${user.email} <br>
      <strong>Username:</strong> ${user.username} <br>
      <strong>Role:</strong> ${user.role} <br>
      <strong>Redirect:</strong> 
      <input id="redirect-${user.email}" 
             value="${user.redirect_url}" 
             style="width:300px;" />
      <br><br>
      <button onclick="updateRedirect('${user.email}')">
        Update Redirect
      </button>
      <button onclick="deleteUser('${user.email}')">
        Delete
      </button>
     </div>
        `;
    });

});

/* =========================
   LOGOUT
========================= */
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
});

window.deleteUser = async function(email) {

  if (!confirm("Are you sure you want to delete this user?"))
    return;

  // Get user id first
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!data) {
    alert("User not found");
    return;
  }

  const userId = data.id;

  const response = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`
      }
    }
  );

  if (!response.ok) {
    alert("Error deleting user");
    return;
  }

  alert("User deleted successfully");
  loadBtn.click(); // reload list
};

window.updateRedirect = async function(email) {

  const newRedirect =
    document.getElementById(`redirect-${email}`).value;

  if (!newRedirect) {
    alert("Redirect URL cannot be empty");
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ redirect_url: newRedirect })
    .eq("email", email);

  if (error) {
    alert("Error updating redirect");
    return;
  }

  alert("Redirect updated successfully 🎉");
};