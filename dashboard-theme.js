const themeBtn = document.getElementById("themeBtn");

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("dashboard-theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    if (themeBtn) themeBtn.textContent = "☀️";
  }
});

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
      localStorage.setItem("dashboard-theme", "light");
      themeBtn.textContent = "☀️";
    } else {
      localStorage.setItem("dashboard-theme", "dark");
      themeBtn.textContent = "🌙";
    }
  });
}