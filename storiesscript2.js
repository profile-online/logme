const btn=document.getElementById('themeBtn');
btn.onclick=()=>{
  document.body.classList.toggle('light');
  btn.textContent=document.body.classList.contains('light')?'🌙':'☀️';
};
