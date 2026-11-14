// InstaSave — frontend conectado a OmniDL
const API_BASE = 'https://omnidl-poov.onrender.com';
const $ = (id) => document.getElementById(id);
const urlInput = $('igUrl');
const statusEl = $('status');
const result = $('result');
const HISTORY_KEY = 'instasave-history-v2';
let currentMedia = null;
let busy = false;

function validInstagramUrl(raw) {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return ['instagram.com', 'm.instagram.com'].includes(host) &&
      /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?/.test(u.pathname);
  } catch { return false; }
}
function setStatus(message, kind='') {
  statusEl.textContent = message;
  statusEl.className = `micro-note ${kind}`.trim();
}
function setBusy(value, message) {
  busy = value;
  $('analyzeBtn').disabled = value;
  $('analyzeBtn').innerHTML = value ? '<span>Analizando…</span><span class="spinner">◌</span>' : '<span>Analizar enlace</span><span>→</span>';
  if (message) setStatus(message);
}
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(url) {
  const items = getHistory().filter(x => x.url !== url);
  items.unshift({url, date: new Date().toLocaleString('es-MX')});
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 8)));
  renderHistory();
}
function renderHistory() {
  const items = getHistory(), list = $('historyList');
  list.replaceChildren();
  if (!items.length) {
    list.className = 'empty-history';
    const icon=document.createElement('span'); icon.textContent='◷';
    const p=document.createElement('p'); p.textContent='Tus enlaces analizados aparecerán aquí.';
    list.append(icon,p); return;
  }
  list.className='history-items';
  items.forEach(item=>{
    const row=document.createElement('button'); row.type='button'; row.className='history-row';
    const url=document.createElement('span'); url.textContent=item.url;
    const date=document.createElement('small'); date.textContent=item.date;
    row.append(url,date);
    row.addEventListener('click',()=>{urlInput.value=item.url;analyze()});
    list.append(row);
  });
}
function apiUrl(path) { return `${API_BASE}${path}`; }
async function readError(response) {
  try { const data=await response.json(); return data.error || `Error ${response.status}`; }
  catch { return `El servidor respondió con error ${response.status}.`; }
}
function previewUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : apiUrl(path);
}
function makeFormatSelect(item) {
  const select=document.createElement('select');
  select.className='format-select';
  select.setAttribute('aria-label',`Formato para ${item.type==='image'?'imagen':'video'}`);
  item.formats.forEach(format=>{
    const option=document.createElement('option');
    option.value=format.id;
    option.textContent=format.label || format.extension.toUpperCase();
    select.append(option);
  });
  return select;
}
function renderMedia(media) {
  currentMedia=media;
  $('resultTitle').textContent=media.title || 'Contenido de Instagram';
  $('platformChip').textContent=media.platform || 'Instagram';
  $('postMeta').textContent=[media.creator, media.items.length===1?'1 elemento':`${media.items.length} elementos`].filter(Boolean).join(' · ');
  const list=$('mediaList'); list.replaceChildren();
  media.items.forEach((item,index)=>{
    const card=document.createElement('article'); card.className='media-card';
    const checkWrap=document.createElement('label'); checkWrap.className='media-check';
    const check=document.createElement('input'); check.type='checkbox';check.className='item-check';check.checked=true;check.dataset.itemId=item.id;
    const checkText=document.createElement('span');checkText.textContent=`Elemento ${index+1}`;
    checkWrap.append(check,checkText);

    const visual=document.createElement('div');visual.className='media-visual';
    if(item.previewUrl){
      const img=document.createElement('img');img.loading='lazy';img.alt=`Vista previa ${index+1}`;img.src=previewUrl(item.previewUrl);
      img.onerror=()=>{img.remove();const fallback=document.createElement('span');fallback.className='visual-fallback';fallback.textContent=item.type==='video'?'▶ Video':'▧ Imagen';visual.append(fallback)};
      visual.append(img);
    } else {
      const fallback=document.createElement('span');fallback.className='visual-fallback';fallback.textContent=item.type==='video'?'▶ Video':'▧ Imagen';visual.append(fallback);
    }
    if(item.type==='video'){const tag=document.createElement('span');tag.className='type-tag';tag.textContent='VIDEO';visual.append(tag)}
    const controls=document.createElement('div');controls.className='media-controls';
    const kind=document.createElement('span');kind.className='media-kind';kind.textContent=item.type==='image'?'Imagen':'Video';
    const formatSelect=makeFormatSelect(item);
    const download=document.createElement('button');download.type='button';download.className='download-one';download.textContent='Descargar ↓';
    download.addEventListener('click',()=>downloadItems([{itemId:item.id,formatId:formatSelect.value}],false));
    controls.append(kind,formatSelect,download);
    card.append(checkWrap,visual,controls);
    list.append(card);
  });
  $('batchBar').hidden=media.items.length<2;
  $('batchActions').hidden=media.items.length<2;
  $('selectAll').checked=true;
  updateSelectedCount();
  result.hidden=false;
  result.scrollIntoView({behavior:'smooth',block:'start'});
}
function selectedIds() {
  return [...document.querySelectorAll('.item-check:checked')].map(x=>x.dataset.itemId);
}
function updateSelectedCount() {
  const count=selectedIds().length;
  $('selectedCount').textContent=`${count} de ${currentMedia?.items.length || 0} seleccionados`;
  $('downloadSelected').disabled=count===0 || busy;
  $('downloadAll').disabled=busy;
}
async function analyze() {
  if(busy)return;
  const raw=urlInput.value.trim();
  if(!validInstagramUrl(raw)){result.hidden=true;setStatus('Pega un enlace válido de una publicación, carrusel o Reel de Instagram.','error');return}
  setBusy(true,'Conectando con el motor de descarga…');
  result.hidden=true;
  try {
    const response=await fetch(apiUrl('/api/v1/media/analyze'),{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:raw})
    });
    if(!response.ok)throw new Error(await readError(response));
    const data=await response.json();
    if(!Array.isArray(data.items)||!data.items.length)throw new Error('No se encontraron archivos descargables en esta publicación.');
    saveHistory(raw);
    renderMedia(data);
    setStatus('Contenido analizado. Selecciona los archivos y el formato que quieras guardar.','success');
  } catch(error) {
    result.hidden=true;
    setStatus(error.message || 'No se pudo conectar con el servidor. Inténtalo de nuevo.','error');
  } finally {setBusy(false)}
}
async function downloadItems(selections, archive) {
  if(busy || !currentMedia || !selections.length)return;
  busy=true;updateSelectedCount();
  const buttonLabel=archive?'Preparando ZIP…':'Preparando descarga…';
  setStatus(buttonLabel);
  try {
    const response=await fetch(apiUrl('/api/v1/media/download'),{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({mediaId:currentMedia.id,selections,archive})
    });
    if(!response.ok)throw new Error(await readError(response));
    const blob=await response.blob();
    const disposition=response.headers.get('Content-Disposition')||'';
    const match=disposition.match(/filename="?([^";]+)"?/i);
    const filename=match?.[1] || (archive || selections.length>1?'InstaSave.zip':`InstaSave.${currentMedia.items.find(i=>i.id===selections[0].itemId)?.formats.find(f=>f.id===selections[0].formatId)?.extension || 'bin'}`);
    const objectUrl=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=objectUrl;a.download=filename;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(objectUrl),60000);
    setStatus('¡Descarga preparada! Revisa las descargas de tu dispositivo.','success');
  } catch(error) {
    setStatus(error.message || 'No se pudo completar la descarga.','error');
  } finally {busy=false;updateSelectedCount()}
}
$('pasteBtn').addEventListener('click',async()=>{
  try{urlInput.value=await navigator.clipboard.readText();setStatus('Enlace pegado. Pulsa «Analizar enlace».')}
  catch{setStatus('No se pudo leer el portapapeles. Mantén pulsado el campo y selecciona Pegar.','error')}
});
$('analyzeBtn').addEventListener('click',analyze);
urlInput.addEventListener('keydown',e=>{if(e.key==='Enter')analyze()});
$('clearHistory').addEventListener('click',()=>{localStorage.removeItem(HISTORY_KEY);renderHistory()});
$('selectAll').addEventListener('change',e=>{document.querySelectorAll('.item-check').forEach(x=>x.checked=e.target.checked);updateSelectedCount()});
$('mediaList').addEventListener('change',e=>{
  if(!e.target.classList.contains('item-check'))return;
  const all=[...document.querySelectorAll('.item-check')];
  $('selectAll').checked=all.length>0&&all.every(x=>x.checked);
  updateSelectedCount();
});
$('downloadSelected').addEventListener('click',()=>{
  if(!currentMedia)return;
  const ids=new Set(selectedIds());
  const selections=currentMedia.items.filter(i=>ids.has(i.id)).map(i=>{
    const card=[...document.querySelectorAll('.media-card')].find(c=>c.querySelector('.item-check')?.dataset.itemId===i.id);
    return {itemId:i.id,formatId:card.querySelector('select').value};
  });
  downloadItems(selections,selections.length>1);
});
$('downloadAll').addEventListener('click',()=>{
  if(!currentMedia)return;
  const selections=currentMedia.items.map((i,index)=>({itemId:i.id,formatId:document.querySelectorAll('.media-card select')[index].value}));
  downloadItems(selections,true);
});
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});
$('installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderHistory();
