const $ = (id) => document.getElementById(id);
const urlInput = $('igUrl');
const status = $('status');
const result = $('result');
const KEY = 'instasave-history-v1';

function validInstagramUrl(raw) {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return ['instagram.com','m.instagram.com'].includes(host) &&
      /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/.test(u.pathname);
  } catch { return false; }
}
function getHistory(){ try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]} }
function saveHistory(items){localStorage.setItem(KEY,JSON.stringify(items.slice(0,12)));renderHistory()}
function renderHistory(){
  const items=getHistory(), list=$('historyList');
  if(!items.length){list.className='empty-history';list.innerHTML='<span>◷</span><p>Tus enlaces analizados aparecerán aquí.</p>';return}
  list.className='';list.innerHTML='';
  const ul=document.createElement('ul');ul.className='history-items';
  items.forEach(item=>{const li=document.createElement('li');li.textContent=item.url;const small=document.createElement('small');small.textContent=item.date;li.appendChild(small);ul.appendChild(li)});
  list.appendChild(ul);
}
$('pasteBtn').addEventListener('click',async()=>{
  try{urlInput.value=await navigator.clipboard.readText();status.textContent='Enlace pegado. Pulsa «Analizar enlace».'}
  catch{status.textContent='No se pudo leer el portapapeles. Mantén pulsado el campo y selecciona Pegar.'}
});
$('analyzeBtn').addEventListener('click',()=>{
  const raw=urlInput.value.trim();
  if(!validInstagramUrl(raw)){status.textContent='Ese enlace no parece una publicación, reel o carrusel válido de Instagram.';result.hidden=true;return}
  result.hidden=false;
  status.textContent='Enlace reconocido. Falta conectar el servicio seguro de procesamiento para obtener los archivos.';
  const items=getHistory();items.unshift({url:raw,date:new Date().toLocaleString('es-MX')});saveHistory(items);
});
$('clearHistory').addEventListener('click',()=>{localStorage.removeItem(KEY);renderHistory()});
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});
$('installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true});
if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderHistory();