const cards = document.querySelectorAll('.flow-card');
const dotsContainer = document.querySelector('.dots');
let index = 0;

// Create dots dynamically
cards.forEach((_, i) => {
  const dot = document.createElement('span');
  if (i === 0) dot.classList.add('active');
  dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dots span');

function showCard(i) {
  cards.forEach(c => c.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  cards[i].classList.add('active');
  dots[i].classList.add('active');
}

// Next button
document.getElementById('next').onclick = () => {
  index = (index + 1) % cards.length;
  showCard(index);
};

// Previous button
document.getElementById('prev').onclick = () => {
  index = (index - 1 + cards.length) % cards.length;
  showCard(index);
};

// Auto-rotate cards
setInterval(() => {
  index = (index + 1) % cards.length;
  showCard(index);
}, 6500);

// Theme toggle
const btn = document.getElementById('themeBtn');
btn.onclick = () => {
  document.body.classList.toggle('light');
  btn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
};
