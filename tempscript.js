function stringToAlpha(str){
  let result='';
  for(let i=0;i<str.length;i++){
    const code=str.charCodeAt(i)%26;
    result+=String.fromCharCode(97+code);
  }
  while(result.length<20){result+=result;}
  return result.substring(0,20);
}

document.getElementById('join-btn').addEventListener('click',()=>{
  const input=document.getElementById('room-code-input').value.trim();
  if(input===""){
    alert("Please enter a room code.");
    return;
  }
  const roomCode=stringToAlpha(input);
  window.location.href=`https://tlk.io/${roomCode}`;
});

document.getElementById('room-code-input').addEventListener('keydown',e=>{
  if(e.key==="Enter"){
    document.getElementById('join-btn').click();
  }
});

const btn=document.getElementById('themeBtn');
btn.onclick=()=>{
  document.body.classList.toggle('light');
  btn.textContent=document.body.classList.contains('light')?'🌙':'☀️';
};
