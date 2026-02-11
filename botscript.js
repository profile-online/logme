/* ================= THEME ================= */
const themeBtn = document.getElementById('themeBtn');
if (localStorage.theme === 'light') {
  document.body.classList.add('light');
  themeBtn.textContent = '🌙';
}
themeBtn.onclick = () => {
  document.body.classList.toggle('light');
  localStorage.theme = document.body.classList.contains('light') ? 'light' : 'dark';
  themeBtn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
};

/* ================= FAQ DATA ================= */
const faq = [
  {
    q: ['what is this', 'about', 'my profile chat'],
    a: 'My Profile Chat lets you create private, temporary chat rooms for meaningful conversations. Each chat expires automatically for privacy.',
  },
  {
    q: ['temporary', 'temp chat', 'room code', 'join again'],
    a: 'Temp Chat rooms are not time-limited. You can use them as long as you want, but messages are not saved. To rejoin the same chat room, both users just need to enter the same room code.',
  },
  {
    q: ['privacy', 'secure', 'safe'],
    a: 'Chats are private, invite-only, and not publicly listed. Share links only with trusted people.',
  },
  {
    q: ['create', 'how to create', 'new chat'],
    a: 'To create a chat room, fill out the request form. If a slot is available, you’ll receive access via email.',
  },
  {
    q: ['password', 'login', 'access'],
    a: 'Each chat room comes with a unique link and password sent securely to your email.',
  },
  {
    q: ['stories'],
    a: 'Stories are shared experiences from users, meant to inspire and guide meaningful conversations.',
  }
];

/* ================= CHAT LOGIC ================= */
const messages = document.getElementById('messages');
const input = document.getElementById('input');

function send() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, 'user');
  input.value = '';

  setTimeout(() => reply(text), 500);
}

function addMsg(text, type) {
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function reply(text) {
  const t = text.toLowerCase();
  const found = faq.find(f => f.q.some(k => t.includes(k)));

  addMsg(
    found ? found.a :
    "I’m not sure about that yet 🤔 You can ask about privacy, temp chats, access, or creating a chat room.",
    'bot'
  );
}
