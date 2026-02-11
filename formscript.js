// THEME toggle
const themeBtn = document.getElementById('themeBtn');
themeBtn.onclick = () => {
  document.body.classList.toggle('light');
  themeBtn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
};

// CAPTCHA
const captchaQ = document.getElementById('captchaQ');
const captchaA = document.getElementById('captchaA');
let a = Math.floor(Math.random() * 10) + 1;
let b = Math.floor(Math.random() * 10) + 1;
captchaQ.textContent = `What is ${a} + ${b}?`;

// MODAL
function openModal(type) {
  document.getElementById(type + 'Modal').style.display = 'flex';
}
function closeModal() {
  document.querySelectorAll('.modal').forEach(m => (m.style.display = 'none'));
}
document.querySelectorAll('.modal').forEach(m => {
  m.onclick = e => {
    if (e.target === m) closeModal();
  };
});

// Checkbox persistence and validation
const checkbox = document.querySelector('input[type="checkbox"]');
const checkboxWrapper = checkbox?.closest('.checkbox');

if (checkbox) {
  checkbox.checked = localStorage.getItem('termsAccepted') === 'true';

  checkbox.addEventListener('change', () => {
    localStorage.setItem('termsAccepted', checkbox.checked);
  });
}

// Form submission handling
const form = document.getElementById('requestForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const emailInput = form.querySelector('input[type="email"]');
  const email = emailInput.value.toLowerCase();
  const allowedDomains = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "proton.me",
    "protonmail.com"
  ];
  const domain = email.split("@")[1];

  if (!allowedDomains.includes(domain)) {
    alert("Please use Gmail, Outlook, Hotmail, or ProtonMail.");
    emailInput.focus();
    return;
  }

  if (parseInt(captchaA.value) !== a + b) {
    alert("Captcha answer is incorrect.");
    captchaA.focus();
    return;
  }

  if (!checkbox.checked) {
    checkboxWrapper.classList.add("error");
    setTimeout(() => checkboxWrapper.classList.remove("error"), 500);
    return;
  }

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    });

    if (response.ok) {
      form.reset();
      localStorage.removeItem("termsAccepted");
      form.style.display = "none";
      successMsg.style.display = "block";
    } else {
      alert("Submission failed. Try again later.");
    }
  } catch (err) {
    alert("Network error. Please try again.");
  }
});

// Auto-grow textarea
const textarea = document.querySelector("textarea");
textarea.addEventListener("input", () => {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
});
