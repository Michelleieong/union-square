const entries={
 market:{title:'The Greenmarket',tag:'01 / COMMERCE & FOOD',desc:'What started as a quick walk turned into browsing stalls, talking to growers, and finding small things to bring home. This is where food and city life meet.',photos:['market.jpg','dairy.jpg','jam.jpg','chicken.jpg','honey.jpg'],index:'FOOD · VENDORS · LOCAL ECONOMY',x:295,y:320},
 lawn:{title:'A Place to Pause',tag:'02 / PARK & REST',desc:'In the middle of a busy neighborhood, people come here to sit in the sun, walk across the grass, or simply do nothing for a while.',photos:['lawn.jpg','crowd.jpg'],index:'GREEN SPACE · REST · SOCIAL LIFE',x:688,y:307},
 community:{title:'The South Plaza',tag:'03 / GATHERING',desc:'The wide steps and open plaza make room for people to sit, chat, take a break, or pass through. The first photograph is a supplied reference image of the steps.',photos:['south_plaza_reference.jpg','crowd.jpg','lawn.jpg'],index:'STEPS · PEOPLE · PUBLIC SPACE',x:694,y:612},
 popup:{title:'Always Something New',tag:'04 / TEMPORARY EVENTS',desc:'Pop-ups and seasonal stalls transform the plaza without changing the place itself. The square feels different from one visit to another.',photos:['nightmarket.jpg','market.jpg'],index:'POP-UPS · SEASONAL CHANGE · COMMERCE',x:746,y:660},
 chess:{title:'Chess Tables',tag:'06 / GAMES & COMMUNITY',desc:'You can stop for a game or watch people play. These two chess photographs are online references, not my own field photos.',photos:['chess_subway_reference.png','chess_players_reference.png'],index:'CHESS · PEOPLE · SHARED SPACE',x:536,y:624},
 dog:{title:'Dog Run',tag:'07 / EVERYDAY ROUTINES',desc:'For some neighbors, coming to the square is part of a daily walk with their dogs. Image: supplied Dog Run reference photo.',photos:['dog_run_reference.png'],index:'DOGS · ROUTINES · COMMUNITY',x:952,y:258},
 transit:{title:'Union Sq in Halloween',tag:'05 / HALLOWEEN AT UNION SQUARE',desc:'Around Halloween, the subway entrance and plaza feel different, with costumes, crowds, and people gathering at night.',photos:['subway.jpg'],index:'SUBWAY · ACCESS · FOOT TRAFFIC',x:369,y:700}
};
const whyOptions=[['market','Shopping or the market','01'],['transit','Just passing through','02'],['lawn','Relaxing in the park','03'],['community','Meeting people','04'],['popup','Events & pop-ups','05'],['chess','Playing chess or watching','06'],['dog','Walking my dog','07']];
const $=id=>document.getElementById(id),svg=$('mapArt'),viewport=$('mapViewport'),canvas=$('mapCanvas'),card=$('hoverCard');let state={zoom:1,dx:0,dy:0,active:null,photo:0,pinned:false,filter:null};
// Cover-fit is also the hard minimum zoom: the illustration always fills the window.
function minCoverZoom(){return Math.max(viewport.clientWidth/1440,viewport.clientHeight/900)}
function constrainPan(){
  const w=viewport.clientWidth,h=viewport.clientHeight,mw=1440*state.zoom,mh=900*state.zoom;
  state.dx=mw<=w?(w-mw)/2:Math.min(0,Math.max(w-mw,state.dx));
  state.dy=mh<=h?(h-mh)/2:Math.min(0,Math.max(h-mh,state.dy));
}
function fit(){const w=viewport.clientWidth,h=viewport.clientHeight;state.zoom=minCoverZoom()*1.12;state.dx=(w-1440*state.zoom)/2;state.dy=(h-900*state.zoom)/2;paint()}

function paint(){constrainPan();canvas.style.transform=`translate(${state.dx}px,${state.dy}px) scale(${state.zoom})`;if(state.active)positionCard(entries[state.active])}
function positionCard(e){const w=viewport.clientWidth,h=viewport.clientHeight;const px=state.dx+e.x*state.zoom,py=state.dy+e.y*state.zoom;let cw=card.offsetWidth||322,ch=card.offsetHeight||405;let x=px+28,y=py-ch*.46;if(x+cw>w-18)x=px-cw-28;if(x<12)x=12;if(y<155)y=155;if(y+ch>h-30)y=h-ch-30;card.style.left=x+'px';card.style.top=Math.max(12,y)+'px'}
function activate(key,pinned=false){if(state.filter&&state.filter!==key)return;state.active=key;state.photo=0;state.pinned=pinned;document.querySelectorAll('.hotspot').forEach(el=>el.classList.toggle('active',el.dataset.key===key));renderCard()}
function renderCard(){const key=state.active;if(!key)return;const e=entries[key];$('cardPhoto').src='assets/'+e.photos[state.photo];$('cardPhoto').alt=e.title+' — related Union Square field photograph';$('photoCount').textContent=`${state.photo+1} / ${e.photos.length}`;$('cardKicker').textContent=e.tag;$('cardTitle').textContent=e.title;$('cardDesc').textContent=e.desc;$('cardIndex').textContent=e.index;card.classList.add('visible');requestAnimationFrame(()=>positionCard(e));}
function hide(){if(state.pinned)return;state.active=null;card.classList.remove('visible');document.querySelectorAll('.hotspot').forEach(el=>el.classList.remove('active'))}
let hideTimer,hoverTimer;document.querySelectorAll('.hotspot').forEach(el=>{const key=el.dataset.key;el.addEventListener('mouseenter',()=>{clearTimeout(hideTimer);clearTimeout(hoverTimer);if(!dragging)hoverTimer=setTimeout(()=>{if(!dragging)activate(key)},360)});el.addEventListener('mouseleave',()=>{clearTimeout(hoverTimer);hideTimer=setTimeout(hide,220)});el.addEventListener('focus',()=>activate(key,true));el.addEventListener('click',ev=>{ev.stopPropagation();openArea(key,false)});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(key,true)}if(e.key==='Escape'){state.pinned=false;hide()}})});card.addEventListener('mouseenter',()=>clearTimeout(hideTimer));card.addEventListener('mouseleave',()=>{state.pinned=false;hideTimer=setTimeout(hide,300)});$('prevPhoto').onclick=e=>{e.stopPropagation();state.photo=(state.photo-1+entries[state.active].photos.length)%entries[state.active].photos.length;renderCard()};$('nextPhoto').onclick=e=>{e.stopPropagation();state.photo=(state.photo+1)%entries[state.active].photos.length;renderCard()};
function openArea(key, focusZoom=true){
  clearTimeout(hoverTimer);clearTimeout(hideTimer);
  state.filter=null;
  document.querySelectorAll('.hotspot').forEach(el=>el.classList.remove('dim'));
  document.querySelectorAll('.reason').forEach(el=>el.classList.remove('selected'));
  if(focusZoom){
    const e=entries[key], w=viewport.clientWidth,h=viewport.clientHeight;
    const target=Math.min(Math.max(minCoverZoom()*2.6,2.25),Math.max(state.zoom*1.32,minCoverZoom()*1.55));
    state.zoom=target;
    // Frame the selected subject slightly away from center to give the photo card room.
    const targetX=w<650?w*.43:w*.43;
    state.dx=targetX-e.x*state.zoom;
    state.dy=h*.52-e.y*state.zoom;
    paint();
  }
  activate(key,true);
}
document.querySelectorAll('.explore-region').forEach(region=>{
  region.addEventListener('click',e=>{e.stopPropagation();openArea(region.dataset.key,false)});
});
function hidePanels(){$('whyPanel').hidden=true;$('whyBtn').setAttribute('aria-expanded','false')}
$('whyBtn').onclick=()=>{const open=$('whyPanel').hidden;hidePanels();$('whyPanel').hidden=!open;$('whyBtn').setAttribute('aria-expanded',String(open))};
document.querySelectorAll('[data-close]').forEach(btn=>btn.onclick=hidePanels);
const historyScreen=$('historyScreen');let historyIndex=0;const slides=4;
function setHistorySlide(index){historyIndex=Math.max(0,Math.min(slides-1,index));$('historyTrack').style.transform=`translateX(-${historyIndex*100}%)`;$('historyCounter').textContent=String(historyIndex+1).padStart(2,'0')+' / 04';historyScreen.classList.toggle('is-now',historyIndex===slides-1);$('historyPrev').disabled=historyIndex===0;$('historyNext').disabled=historyIndex===slides-1;[...$('historyDots').children].forEach((b,i)=>b.classList.toggle('on',i===historyIndex))}
function openHistory(){hidePanels();clearTimeout(hoverTimer);clearTimeout(hideTimer);state.pinned=false;hide();historyScreen.hidden=false;$('historyBtn').setAttribute('aria-expanded','true');setHistorySlide(0);$('historyClose').focus()}
function closeHistory(){historyScreen.hidden=true;$('historyBtn').setAttribute('aria-expanded','false');$('historyBtn').focus()}
$('historyBtn').onclick=()=>historyScreen.hidden?openHistory():closeHistory();$('historyClose').onclick=closeHistory;$('historyNext').onclick=()=>setHistorySlide(historyIndex+1);$('historyPrev').onclick=()=>setHistorySlide(historyIndex-1);
[...$('historyDots').children].forEach((b,i)=>b.onclick=()=>setHistorySlide(i));
document.addEventListener('keydown',e=>{if(historyScreen.hidden)return;if(e.key==='Escape')closeHistory();if(e.key==='ArrowRight')setHistorySlide(historyIndex+1);if(e.key==='ArrowLeft')setHistorySlide(historyIndex-1)});
let touchStartX=null;historyScreen.addEventListener('touchstart',e=>{if(e.touches.length===1)touchStartX=e.touches[0].clientX},{passive:true});historyScreen.addEventListener('touchend',e=>{if(touchStartX===null)return;const delta=e.changedTouches[0].clientX-touchStartX;if(Math.abs(delta)>45)setHistorySlide(historyIndex+(delta<0?1:-1));touchStartX=null},{passive:true});
whyOptions.forEach(([key,label,symbol])=>{const b=document.createElement('button');b.className='reason';b.innerHTML=`<b>${symbol}</b><span>${label}</span>`;b.onclick=()=>{state.filter=key;document.querySelectorAll('.hotspot').forEach(el=>el.classList.toggle('dim',el.dataset.key!==key));document.querySelectorAll('.reason').forEach(el=>el.classList.toggle('selected',el===b));hidePanels();activate(key,true);const e=entries[key],w=viewport.clientWidth,h=viewport.clientHeight;state.dx=w*.53-e.x*state.zoom;state.dy=h*.52-e.y*state.zoom;paint()};$('reasonOptions').appendChild(b)});
$('showAll').onclick=()=>{state.filter=null;state.pinned=false;document.querySelectorAll('.hotspot').forEach(el=>el.classList.remove('dim'));document.querySelectorAll('.reason').forEach(el=>el.classList.remove('selected'));hidePanels();hide();fit()};
function zoomAt(factor,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){const old=state.zoom,next=Math.min(Math.max(minCoverZoom()*2.6,2.25),Math.max(minCoverZoom(),old*factor));state.dx=cx-(cx-state.dx)*next/old;state.dy=cy-(cy-state.dy)*next/old;state.zoom=next;paint()}
$('zoomIn').onclick=()=>zoomAt(1.2);$('zoomOut').onclick=()=>zoomAt(1/1.2);$('reset').onclick=()=>{state.pinned=false;state.filter=null;document.querySelectorAll('.hotspot').forEach(el=>el.classList.remove('dim'));hide();fit()};
viewport.addEventListener('wheel',e=>{if(e.target.closest('.hover-card,.dropdown'))return;e.preventDefault();const r=viewport.getBoundingClientRect();zoomAt(e.deltaY<0?1.08:1/1.08,e.clientX-r.left,e.clientY-r.top)},{passive:false});let dragging=null;viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.hotspot,.explore-region,.hover-card,button'))return;clearTimeout(hoverTimer);if(!state.pinned)hide();dragging={x:e.clientX,y:e.clientY,dx:state.dx,dy:state.dy};viewport.classList.add('dragging');viewport.setPointerCapture(e.pointerId)});viewport.addEventListener('pointermove',e=>{if(!dragging)return;state.dx=dragging.dx+e.clientX-dragging.x;state.dy=dragging.dy+e.clientY-dragging.y;paint()});function stopDrag(){dragging=null;viewport.classList.remove('dragging')}viewport.addEventListener('pointerup',stopDrag);viewport.addEventListener('pointercancel',stopDrag);viewport.addEventListener('click',e=>{if(e.target.closest('.hotspot,.explore-region,.hover-card'))return;if(state.pinned){state.pinned=false;hide()}});window.addEventListener('resize',fit);fit();
