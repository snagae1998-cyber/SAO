(()=>{
'use strict';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const el={
  game:$('#game'), canvas:$('#canvas'), balls:$('#balls'), spins:$('#spins'), wins:$('#wins'), best:$('#best'),
  msg:$('#message'), sub:$('#submsg'), mode:$('#mode'), stage:$('#stageName'), floor:$('#floorNum'),
  rushCounter:$('#rushCounter'), stLeft:$('#stLeft'), rushMilestone:$('#rushMilestone'), rushSecret:$('#rushSecret'),rushEvolution:$('#rushEvolution'),rushEvolutionLabel:$('#rushEvolutionLabel'),rushEvolutionBar:$('#rushEvolutionBar'), sceneTitle:$('#sceneTitle'), assistLine:$('#assistLine'),
  enemy:$('#enemy'), hpBar:$('#hpBar'), battleCard:$('#battleCard'), battleName:$('#battleName'),
  battleChance:$('#battleChance'), routeTag:$('#routeTag'), awakening:$('#awakening'), skillCutin:$('#skillCutin'),
  seven:$('#sevenGimmick'), flash:$('#flash'), fire:$('#fire'), custom:$('#custom'), customPanel:$('#customPanel'),
  sound:$('#soundBtn'), auto:$('#autoBtn'), rushStyle:$('#rushStyleBtn'), result:$('#resultPanel'),
  resSpins:$('#resSpins'), resWins:$('#resWins'), resBest:$('#resBest'), resDiff:$('#resDiff'),
  relPanel:$('#reliabilityPanel'), relGrid:$('#relGrid'), relBtn:$('#reliabilityBtn'), relClose:$('#relClose'), lawBanner:$('#lawBanner'), hiddenLawBadge:$('#hiddenLawBadge'),flowStep:$('#flowStep'),flowBar:$('#flowBar'),historyBtn:$('#historyBtn'),achievementBtn:$('#achievementBtn'),historyPanel:$('#historyPanel'),achievementPanel:$('#achievementPanel'),historyClose:$('#historyClose'),achievementClose:$('#achievementClose'),historySummary:$('#historySummary'),historyList:$('#historyList'),achievementSummary:$('#achievementSummary'),achievementList:$('#achievementList'),settingsBtn:$('#settingsBtn'),audioTestBtn:$('#audioTestBtn'),musicCustomBtn:$('#musicCustomBtn'),musicCustomPanel:$('#musicCustomPanel'),musicCustomClose:$('#musicCustomClose'),musicCustomList:$('#musicCustomList'),sevenRole:$('#sevenRole'),audioTestPanel:$('#audioTestPanel'),audioTestClose:$('#audioTestClose'),demoBtn:$('#demoBtn'),settingsPanel:$('#settingsPanel'),settingsClose:$('#settingsClose'),bgmVol:$('#bgmVol'),seVol:$('#seVol'),autoSpeed:$('#autoSpeed'),effectDensity:$('#effectDensity'),sensoryLevel:$('#sensoryLevel'),resetDataBtn:$('#resetDataBtn'),dataBtn:$('#dataBtn'),catalogBtn:$('#catalogBtn'),dataPanel:$('#dataPanel'),catalogPanel:$('#catalogPanel'),dataClose:$('#dataClose'),catalogClose:$('#catalogClose'),dataSummary:$('#dataSummary'),dataChart:$('#dataChart'),catalogSummary:$('#catalogSummary'),catalogList:$('#catalogList'),slashFx:$('#slashFx'),assistCutin:$('#assistCutin'),assistName:$('#assistName'),bossScene:$('#bossScene'),bossTitleFx:$('#bossTitleFx'),bonusScene:$('#bonusScene'),bonusTitleFx:$('#bonusTitleFx'),bonusCountFx:$('#bonusCountFx'),rushScene:$('#rushScene'),rushTitleFx:$('#rushTitleFx')
};
const ctx=el.canvas.getContext('2d');
const reels=$$('.reel'), holds=$$('.hold'), customButtons=[...document.querySelectorAll('#customPanel [data-mode]')];

const CFG={
  startBalls:750,
  normalRate:1/199,
  rushRate:1/29.9,
  lightningRate:1/12.8,
  st:100,
  rushEntry:0.60,
  upperEntry:0.18,
  premium3000:0.18,
  revival:0.14,
  holdMax:4,
  shotInterval:115,
  autoInterval:430,
  seven:{hitBlue:0.60,targetBlue:0.777,redHit:0.09,zebraHit:0.02,redupRedHit:0.28},
  features:{
    redHold:{hit:0.18,target:0.28}, goldHold:{hit:0.08,target:0.72},
    sevenTempai:{hit:0.24,target:0.65}, episode:{hit:0.16,target:0.82},
    asunaAssist:{hit:0.38,target:0.35}, switch:{hit:0.28,target:0.32},
    boss:{hit:0.31,target:0.48}, dual:{hit:0.24,target:0.72}, linkAlert:{hit:0.45,target:0.45}
  }
};

const STAGES=[
 {min:1,max:9,name:'第1層・はじまりの街',assist:['クライン','エギル']},
 {min:10,max:24,name:'低層フィールド',assist:['シリカ','リズベット']},
 {min:25,max:49,name:'中層攻略区',assist:['アスナ','クライン','エギル']},
 {min:50,max:74,name:'高層攻略区',assist:['アスナ','クライン','エギル','リズベット']},
 {min:75,max:99,name:'第75層・決戦区',assist:['アスナ','クライン','エギル']},
 {min:100,max:100,name:'最終到達領域',assist:['アスナ']}
];

const state={
  W:390,H:650,dpr:Math.min(devicePixelRatio||1,2), balls:CFG.startBalls,spins:0,wins:0,best:0,chain:0,
  firing:false,lastShot:0,shots:[],pins:[],queue:[],spinning:false,roundPlaying:false,
  rush:false,lightning:false,st:0,floor:1,sevenMode:'on',rushStyle:'battle',soundOn:true,autoPlay:false,autoTimer:null
};


const LAW_LIBRARY=Array.isArray(window.SAO_LAWS)?window.SAO_LAWS:[];
const LAW_BY_CATEGORY=LAW_LIBRARY.reduce((m,x)=>{(m[x.category]??=[]).push(x);return m;},{});
function lawPick(category,ctx={}){
  let pool=(LAW_BY_CATEGORY[category]||[]).filter(x=>!x.hitOnly||ctx.hit);
  if(ctx.character)pool=pool.filter(x=>!x.character||x.character===ctx.character);
  if(ctx.mode)pool=pool.filter(x=>!x.mode||x.mode===ctx.mode);
  if(!pool.length)return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
function showLaw(law){
  if(!law){el.lawBanner.textContent='LAW --';el.lawBanner.className='';return;}
  el.lawBanner.textContent=`LAW: ${law.label}`;el.lawBanner.className=law.rarity||'';
}
const SFX={
 shot:new Audio('shot.wav'),start:new Audio('start.wav'),sword:new Audio('sword.wav'),
 seven:new Audio('seven.wav'),win:new Audio('win.wav'),rush:new Audio('rush.wav')
};
Object.values(SFX).forEach(a=>a.preload='auto');



let bgmCtx=null,bgmOsc=null,bgmOsc2=null,bgmGain=null,bgmPulseTimer=null;
function audioCtx(){
 if(!bgmCtx){
  try{bgmCtx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}
 }
 if(bgmCtx&&bgmCtx.state==='suspended')bgmCtx.resume().catch(()=>{});
 return bgmCtx;
}
function tone(freq=440,dur=.12,type='sine',gain=.08,delay=0,slide=0){
 const c=audioCtx();if(!c||!state.soundOn||settings.seVol<=0)return;
 const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
 o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),t);
 if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0001,gain*settings.seVol),t+.008);
 g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.03);
}
function noise(dur=.12,gain=.06,delay=0,highpass=400){
 const c=audioCtx();if(!c||!state.soundOn||settings.seVol<=0)return;
 const len=Math.max(1,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
 for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
 const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime+delay;
 f.type='highpass';f.frequency.value=highpass;g.gain.setValueAtTime(gain*settings.seVol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 s.buffer=buf;s.connect(f);f.connect(g);g.connect(c.destination);s.start(t);s.stop(t+dur+.02);
}
function haptic(pattern){
 try{if(navigator.vibrate&&state.soundOn)navigator.vibrate(pattern)}catch(e){}
}
function sensoryShake(kind='hit'){
 document.body.classList.remove('sensoryHit','sensoryJackpot');void document.body.offsetWidth;
 document.body.classList.add(kind==='jackpot'?'sensoryJackpot':'sensoryHit');
}



let sevenSyncTimers=[];
function clearSevenSync(){
 sevenSyncTimers.forEach(clearTimeout);sevenSyncTimers=[];
 if(el.sevenRole){el.sevenRole.className='';el.sevenRole.style.display='none'}
}
function sevenAt(ms,fn){const id=setTimeout(fn,ms);sevenSyncTimers.push(id);return id}
function sevenRoleClass(c){
 if(!el.sevenRole)return;
 el.sevenRole.style.display='grid';el.sevenRole.className='on '+c;
}
function sevenHaptic(pattern){try{if(navigator.vibrate)navigator.vibrate(pattern)}catch(e){}}
function sevenCinematic(nextMusic=null){
 clearSevenSync();
 // 0ms: world dims and role mechanism wakes.
 sevenRoleClass('wake');
 sevenHaptic([55,75,55]);
 // 620ms: the physical 7 drops into the foreground.
 sevenAt(620,()=>{sevenRoleClass('drop');sevenHaptic([95,45,150])});
 // 980ms: long violent tremor. Rendered SE starts here to bind sound to the object.
 sevenAt(980,()=>{sevenRoleClass('tremor');renderedSE('seven',true);sevenHaptic([55,35,55,35,55,35,55,35,70,45,90])});
 // 3190ms: deliberate dead-zone. Stop BGM to create contrast before impact.
 sevenAt(3190,()=>{musicStop(.08);sevenRoleClass('drop')});
 // 3490ms: lock/break impact.
 sevenAt(3490,()=>{sevenRoleClass('break');sevenHaptic([220,55,120,45,300]);renderedSE('confirm',true)});
 // 3890ms: musical release. Custom music respects its saved chorus/start marker.
 sevenAt(3890,()=>{if(nextMusic)musicPlay(nextMusic,true,.08)});
 // 4750ms: leave the stage.
 sevenAt(4750,()=>clearSevenSync());
}
const RENDERED_SE={prealert:'PREALERT_V203.wav',seven:'SEVEN_V203.wav',push:'PUSH_V203.wav',confirm:'CONFIRM_V203.wav',jackpot:'JACKPOT_V203.wav',rush:'RUSH_V203.wav',slash:'SWORD_V203.wav'};
let renderedSePlayers=[];
function renderedSE(name,suppressHaptic=false){
 if(!state.soundOn||settings.seVol<=0)return;
 const hp={
  prealert:[90,110,160,180,240],
  seven:[180,140,80,70,80,70,80,70,80,70,80,420,110,120,260],
  push:[120,160,260],
  confirm:[70,90,70,90,70,180,260],
  jackpot:[220,280,80,90,80,90,180,350,140,120,300],
  rush:[160,300,60,180,60,150,60,120,60,90,60,70,500,100,250],
  slash:[35,35,80,90,120]
 };if(!suppressHaptic){try{if(navigator.vibrate&&hp[name])navigator.vibrate(hp[name])}catch(e){}}
 const file=RENDERED_SE[name];if(!file)return;
 try{
  const a=new Audio(file);a.volume=Math.max(0,Math.min(1,settings.seVol));
  renderedSePlayers.push(a);a.addEventListener('ended',()=>{renderedSePlayers=renderedSePlayers.filter(x=>x!==a)});
  a.play().catch(()=>{});
 }catch(e){}
}
function stopRenderedSE(){
 renderedSePlayers.forEach(a=>{try{a.pause();a.currentTime=0}catch(e){}});
 renderedSePlayers=[];
}
function psycho(name){
 renderedSE(name);
 const _oldSound=state.soundOn;state.soundOn=false;
 const level=settings.sensoryLevel||'overdrive';
 const mul=level==='max'?1.35:level==='standard'?.72:1;
 if(name==='prealert'){
  // silence -> sub thump -> rising chirp -> hard transient
  tone(44,.18,'sawtooth',.15*mul,0,36);
  tone(880,.05,'square',.05*mul,.16,1320);
  noise(.045,.11*mul,.205,2400);
  tone(1760,.08,'square',.06*mul,.21,900);
  haptic(level==='max'?[20,18,35,10,55]:[18,20,30]);
  sensoryShake();
 }
 else if(name==='seven'){
  // three-stage: subterranean rumble -> metallic charge -> violent lock
  tone(32,.30,'sawtooth',.17*mul,0,28);
  tone(48,.26,'triangle',.11*mul,.02,36);
  noise(.10,.065*mul,.18,180);
  tone(520,.14,'sawtooth',.075*mul,.24,980);
  tone(1480,.09,'square',.075*mul,.34,1200);
  noise(.055,.14*mul,.41,3200);
  tone(2400,.10,'square',.07*mul,.42,1200);
  haptic([38,20,52,18,74,12,110]);
  sensoryShake('jackpot');
 }
 else if(name==='push'){
  tone(38,.10,'square',.15*mul,0,22);
  noise(.05,.12*mul,.03,220);
  tone(76,.13,'sawtooth',.10*mul,.06,-18);
  haptic([34,12,55]);sensoryShake();
 }
 else if(name==='confirm'){
  // unmistakable ascending lock-on
  tone(330,.08,'square',.065*mul,0,330);
  tone(660,.08,'square',.07*mul,.07,660);
  tone(1320,.10,'square',.075*mul,.14,1320);
  tone(2640,.24,'sine',.085*mul,.22,900);
  noise(.08,.085*mul,.21,4200);
  haptic([24,12,24,12,90]);sensoryShake('jackpot');
 }
 else if(name==='jackpot'){
  // sub cannon + octave cascade + air burst
  tone(28,.36,'sawtooth',.18*mul,0,35);
  noise(.14,.13*mul,.02,80);
  tone(196,.13,'square',.065*mul,.18,196);
  tone(392,.13,'square',.07*mul,.28,392);
  tone(784,.14,'square',.075*mul,.39,784);
  tone(1568,.16,'square',.08*mul,.51,900);
  tone(3136,.32,'sine',.09*mul,.65,1000);
  noise(.16,.10*mul,.62,2500);
  haptic([60,16,60,16,130]);sensoryShake('jackpot');
 }
 else if(name==='rush'){
  // launch sequence with accelerating pulses
  tone(46,.22,'sawtooth',.15*mul,0,35);
  tone(180,.08,'square',.06*mul,.10,180);
  tone(360,.08,'square',.065*mul,.18,360);
  tone(720,.08,'square',.07*mul,.25,720);
  tone(1440,.10,'square',.075*mul,.32,1440);
  tone(2880,.20,'sine',.085*mul,.41,700);
  noise(.18,.09*mul,.38,1400);
  haptic([35,12,35,12,35,12,95]);sensoryShake('jackpot');
 }
 else if(name==='slash'){
  noise(.075,.12*mul,0,1800);
  tone(2600,.085,'sawtooth',.07*mul,0,-1850);
  tone(820,.06,'square',.045*mul,.045,-400);
  haptic([10,8,18]);sensoryShake();
 }
 state.soundOn=_oldSound;
}



const CUSTOM_MUSIC_SLOTS=['normal','sp','dual','jackpot','rush','lightning'];
const CUSTOM_MUSIC_DB='vrSwordCustomMusicV206',CUSTOM_MUSIC_STORE='tracks';
let customMusicMeta={};
function loadCustomMusicMeta(){
 try{customMusicMeta=JSON.parse(localStorage.getItem('vrSwordCustomMusicMetaV206')||'{}')||{}}
 catch(e){customMusicMeta={}}
}
function saveCustomMusicMeta(){try{localStorage.setItem('vrSwordCustomMusicMetaV206',JSON.stringify(customMusicMeta))}catch(e){}}
function musicDb(){
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open(CUSTOM_MUSIC_DB,1);
  r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(CUSTOM_MUSIC_STORE))db.createObjectStore(CUSTOM_MUSIC_STORE)};
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
 });
}
async function customMusicPut(slot,file){
 const db=await musicDb();
 await new Promise((res,rej)=>{
  const tx=db.transaction(CUSTOM_MUSIC_STORE,'readwrite');
  tx.objectStore(CUSTOM_MUSIC_STORE).put(file,slot);
  tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
 });
 customMusicMeta[slot]={name:file.name,type:file.type,start:Number(customMusicMeta[slot]?.start||0),mode:customMusicMeta[slot]?.mode||'position'};
 saveCustomMusicMeta();
}
async function customMusicGet(slot){
 try{
  const db=await musicDb();
  return await new Promise((res,rej)=>{
   const tx=db.transaction(CUSTOM_MUSIC_STORE,'readonly'),r=tx.objectStore(CUSTOM_MUSIC_STORE).get(slot);
   r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error);
  });
 }catch(e){return null}
}
async function customMusicDelete(slot){
 try{
  const db=await musicDb();
  await new Promise((res,rej)=>{
   const tx=db.transaction(CUSTOM_MUSIC_STORE,'readwrite');
   tx.objectStore(CUSTOM_MUSIC_STORE).delete(slot);
   tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
  });
 }catch(e){}
 delete customMusicMeta[slot];saveCustomMusicMeta();
}
function slotLabel(k){return {normal:'通常',sp:'SP',dual:'二刀流',jackpot:'大当たり',rush:'RUSH',lightning:'LIGHTNING'}[k]||k}
function renderCustomMusic(){
 el.musicCustomList.innerHTML=CUSTOM_MUSIC_SLOTS.map(slot=>{
  const m=customMusicMeta[slot]||{};
  return `<div class="musicSlot" data-slot="${slot}">
   <div class="musicSlotHead"><span>${slotLabel(slot)}</span><span>${m.name?'登録済み':'未登録'}</span></div>
   <div class="musicSlotName">${m.name||'端末から音源を選択'}</div>
   <input class="musicFile" type="file" accept="audio/*,.mp3,.m4a,.wav,.aac">
   <div class="musicSlotControls">
    <input class="musicStart" type="number" min="0" step="0.1" value="${Number(m.start||0)}" placeholder="開始秒">
    <select class="musicMode">
      <option value="position"${!m.mode||m.mode==='position'?' selected':''}>指定位置</option>
      <option value="start"${m.mode==='start'?' selected':''}>最初から</option>
      <option value="random"${m.mode==='random'?' selected':''}>ランダム</option>
    </select>
    <button class="musicPreview">試聴</button><button class="musicDelete">削除</button>
   </div>
  </div>`;
 }).join('');
 el.musicCustomList.querySelectorAll('.musicSlot').forEach(row=>{
  const slot=row.dataset.slot,fi=row.querySelector('.musicFile'),start=row.querySelector('.musicStart'),mode=row.querySelector('.musicMode');
  fi.addEventListener('change',async()=>{const f=fi.files&&fi.files[0];if(!f)return;await customMusicPut(slot,f);renderCustomMusic()});
  const saveMeta=()=>{customMusicMeta[slot]={...(customMusicMeta[slot]||{}),start:Number(start.value)||0,mode:mode.value};saveCustomMusicMeta()};
  start.addEventListener('change',saveMeta);mode.addEventListener('change',saveMeta);
  row.querySelector('.musicPreview').addEventListener('click',()=>musicPlay(slot,false,.1));
  row.querySelector('.musicDelete').addEventListener('click',async()=>{await customMusicDelete(slot);if(musicKey===slot)musicStop(0);renderCustomMusic()});
 });
}
loadCustomMusicMeta();
const MUSIC_TRACKS={
 normal:'BGM_NORMAL_V205.wav',sp:'BGM_SP_V205.wav',dual:'BGM_DUAL_V205.wav',
 jackpot:'BGM_JACKPOT_V205.wav',rush:'BGM_RUSH_V205.wav',lightning:'BGM_LIGHTNING_V205.wav'
};
let musicPlayer=null,musicKey='';
async function musicPlay(key,loop=true,fade=.35){
 if(!state.soundOn||settings.bgmVol<=0)return;
 if(musicKey===key&&musicPlayer&&!musicPlayer.paused)return;
 const custom=await customMusicGet(key);
 const file=custom?URL.createObjectURL(custom):MUSIC_TRACKS[key];
 if(!file)return;
 const old=musicPlayer;musicKey=key;
 try{
  const a=new Audio(file);a.loop=loop;a.volume=0;
  if(!custom)a.playbackRate=key==='lightning'?1.12:key==='rush'?1.08:key==='dual'?1.06:1;
  musicPlayer=a;
  a.addEventListener('loadedmetadata',()=>{
   const meta=customMusicMeta[key]||{};
   let pos=0;
   if(custom){
    if(meta.mode==='random'&&a.duration>1)pos=Math.random()*Math.max(0,a.duration-1);
    else if(meta.mode==='position')pos=Number(meta.start||0);
    else pos=0;
    a.currentTime=Math.min(Math.max(0,pos),Math.max(0,a.duration-.05));
   }
   a.play().catch(()=>{});
   let k=0,steps=10;
   const iv=setInterval(()=>{
    k++;
    if(musicPlayer===a)a.volume=Math.min(settings.bgmVol,k/steps*settings.bgmVol);
    if(old)old.volume=Math.max(0,(1-k/steps)*settings.bgmVol);
    if(k>=steps){clearInterval(iv);if(old){old.pause();old.currentTime=0}}
   },Math.max(20,fade*1000/steps));
  });
  a.addEventListener('ended',()=>{if(custom)URL.revokeObjectURL(file)});
 }catch(e){}
}
function musicStop(fade=.25){
 const a=musicPlayer;if(!a)return;musicPlayer=null;musicKey='';
 let k=10;const iv=setInterval(()=>{k--;a.volume=Math.max(0,k/10*settings.bgmVol);if(k<=0){clearInterval(iv);a.pause();a.currentTime=0}},Math.max(20,fade*100));
}
function musicAuto(){
 if(state.rush){musicPlay(state.lightning?'lightning':'rush');return;}
 musicPlay('normal');
}
function startBgm(){musicAuto();
 const c=audioCtx();if(!c||!state.soundOn||settings.bgmVol<=0||bgmOsc)return;
 bgmGain=c.createGain();bgmGain.gain.value=.004*settings.bgmVol;
 bgmOsc=c.createOscillator();bgmOsc2=c.createOscillator();
 bgmOsc.type='sawtooth';bgmOsc2.type='triangle';bgmOsc.frequency.value=55;bgmOsc2.frequency.value=82.5;
 const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=360;
 bgmOsc.connect(f);bgmOsc2.connect(f);f.connect(bgmGain);bgmGain.connect(c.destination);bgmOsc.start();bgmOsc2.start();
 bgmPulseTimer=setInterval(()=>{
  if(!bgmGain||!bgmCtx)return;
  const intensity=state.rush?(state.lightning?.008:.006):.004;
  bgmGain.gain.cancelScheduledValues(bgmCtx.currentTime);
  bgmGain.gain.setValueAtTime(.001*settings.bgmVol,bgmCtx.currentTime);
  bgmGain.gain.linearRampToValueAtTime(intensity*settings.bgmVol,bgmCtx.currentTime+.06);
  bgmGain.gain.linearRampToValueAtTime(.002*settings.bgmVol,bgmCtx.currentTime+.20);
 },state.rush?280:520);
}
function updateBgm(){if(bgmGain)bgmGain.gain.value=state.soundOn?.004*settings.bgmVol:0;if(musicPlayer)musicPlayer.volume=state.soundOn?settings.bgmVol:0}
function stopBgm(){musicStop(0);
 if(bgmPulseTimer){clearInterval(bgmPulseTimer);bgmPulseTimer=null}
 try{if(bgmOsc)bgmOsc.stop();if(bgmOsc2)bgmOsc2.stop();if(bgmCtx)bgmCtx.close()}catch(e){}
 bgmOsc=bgmOsc2=null;bgmCtx=null;bgmGain=null;
}

const LEGACY_DRAMATIC_SFX_BLOCKED=new Set(['seven','win','rush','sword']);
function sfx(name,vol=1){if(LEGACY_DRAMATIC_SFX_BLOCKED.has(name))return;
  if(!state.soundOn||!SFX[name])return;
  try{const a=SFX[name].cloneNode();a.volume=Math.min(1,vol*settings.seVol);a.play().catch(()=>{});}catch(_){ }
}

const SAVE_KEY='vrSwordPachinkoV14';
const ACHIEVEMENTS=[
 {id:'first_hit',name:'攻略開始',desc:'初めて大当たりする',test:d=>d.totalWins>=1},
 {id:'ten_hits',name:'歴戦の剣士',desc:'累計大当たり10回',test:d=>d.totalWins>=10},
 {id:'hundred_hits',name:'攻略組',desc:'累計大当たり100回',test:d=>d.totalWins>=100},
 {id:'thousand_spins',name:'千回転の旅',desc:'累計1000回転',test:d=>d.totalSpins>=1000},
 {id:'rush_entry',name:'SWORD RUSH',desc:'RUSHへ突入',test:d=>d.rushEntries>=1},
 {id:'lightning_entry',name:'LIGHTNING',desc:'上位RUSHへ到達',test:d=>d.lightningEntries>=1},
 {id:'chain10',name:'十連撃',desc:'10連達成',test:d=>d.bestChain>=10},
 {id:'chain20',name:'二十連撃',desc:'20連達成',test:d=>d.bestChain>=20},
 {id:'blue10',name:'激震観測者',desc:'7ブルを10回見る',test:d=>d.sevenBuzz>=10},
 {id:'secret5',name:'違和感ハンター',desc:'SECRET法則を5種類発見',test:d=>d.secretFound.length>=5},
 {id:'secret24',name:'法則完全攻略',desc:'SECRET法則24種類発見',test:d=>d.secretFound.length>=24},
 {id:'floor75',name:'第75層',desc:'75層へ到達',test:d=>d.maxFloor>=75}
];

let settings={bgmVol:.70,seVol:.85,autoInterval:430,effectDensity:'normal',sensoryLevel:'overdrive'};
let demoMode=false,demoTimer=null;
function loadSettings(){
 try{
  const raw=localStorage.getItem(SAVE_KEY+'_settings');if(!raw)return;
  const x=JSON.parse(raw);settings={...settings,...x};
 }catch(e){console.warn('SETTINGS LOAD RESET',e)}
}
function saveSettings(){
 try{localStorage.setItem(SAVE_KEY+'_settings',JSON.stringify(settings))}catch(e){console.warn('SETTINGS SAVE FAILED',e)}
}
function applySettingsUI(){
 if(el.bgmVol)el.bgmVol.value=Math.round(settings.bgmVol*100);
 if(el.seVol)el.seVol.value=Math.round(settings.seVol*100);
 if(el.autoSpeed)el.autoSpeed.value=String(settings.autoInterval);
 if(el.effectDensity)el.effectDensity.value=settings.effectDensity;if(el.sensoryLevel)el.sensoryLevel.value=settings.sensoryLevel||'overdrive';
}
function effectAllowed(kind='normal'){
 if(settings.effectDensity==='high')return true;
 if(settings.effectDensity==='low')return kind==='major';
 return true;
}
let career={
 totalSpins:0,totalWins:0,totalBallsWon:0,bestChain:0,rushEntries:0,lightningEntries:0,
 sevenBuzz:0,sevenBuzzHits:0,maxFloor:1,secretFound:[],lawFound:[],unlocked:[],history:[],graph:[]
};
function safeLoad(){
 try{
   const raw=localStorage.getItem(SAVE_KEY);if(!raw)return;
   const x=JSON.parse(raw);if(!x||x.version!==14||!x.career)return;
   career={...career,...x.career};
   if(Array.isArray(x.career.secretFound))career.secretFound=[...new Set(x.career.secretFound)];if(Array.isArray(x.career.lawFound))career.lawFound=[...new Set(x.career.lawFound)];if(Array.isArray(x.career.graph))career.graph=x.career.graph.slice(-60);
   if(Array.isArray(x.career.unlocked))career.unlocked=[...new Set(x.career.unlocked)];
   if(Array.isArray(x.career.history))career.history=x.career.history.slice(0,50);
   if(Number.isFinite(x.balls)&&x.balls>=0)state.balls=x.balls;
 }catch(e){console.warn('SAVE LOAD RESET',e)}
}
function saveGame(){
 try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:14,balls:state.balls,career}))}catch(e){console.warn('SAVE FAILED',e)}
}
function checkAchievements(){
 for(const a of ACHIEVEMENTS){
   if(!career.unlocked.includes(a.id)&&a.test(career)){
     career.unlocked.push(a.id);el.sub.textContent=`ACHIEVEMENT: ${a.name}`;
   }
 }
 saveGame();
}
function recordHistory(type,extra={}){
 career.history.unshift({type,spin:career.totalSpins,at:new Date().toISOString(),...extra});
 career.history=career.history.slice(0,50);saveGame();
}
function renderHistory(){
 const rate=career.sevenBuzz?career.sevenBuzzHits/career.sevenBuzz:0;
 el.historySummary.innerHTML=`累計回転 <b>${career.totalSpins}</b> / 累計大当たり <b>${career.totalWins}</b><br>
 最高連荘 <b>${career.bestChain}</b> / 累計獲得 <b>${career.totalBallsWon}</b>玉<br>
 7ブル ${career.sevenBuzz}回 / 的中率 <b>${(rate*100).toFixed(1)}%</b> / 最高到達 第${career.maxFloor}層`;
 el.historyList.innerHTML=career.history.length?career.history.map(x=>
   `<div class="v14Row"><span>${x.type}</span><span>${x.spin}回転${x.chain?` / ${x.chain}連`:''}</span></div>`).join(''):'履歴はまだありません';
}
function renderAchievements(){
 el.achievementSummary.textContent=`${career.unlocked.length} / ${ACHIEVEMENTS.length} UNLOCKED`;
 el.achievementList.innerHTML=ACHIEVEMENTS.map(a=>{
   const u=career.unlocked.includes(a.id);
   return `<div class="v14Row ${u?'v14Unlocked':'v14Locked'}"><span>${u?'✓':'LOCK'} ${a.name}</span><span>${a.desc}</span></div>`;
 }).join('');
}

function discoverLaw(law){
 if(!law||!law.id)return;
 if(!career.lawFound.includes(law.id)){career.lawFound.push(law.id);saveGame()}
}
function addGraphPoint(){
 const diff=state.balls-CFG.startBalls;
 career.graph.push({spin:career.totalSpins,diff});
 career.graph=career.graph.slice(-60);
}
function renderData(){
 const firstHitRate=career.totalWins?career.totalSpins/career.totalWins:0;
 const buzzRate=career.sevenBuzz?career.sevenBuzzHits/career.sevenBuzz:0;
 el.dataSummary.innerHTML=`累計回転 <b>${career.totalSpins}</b> / 大当たり <b>${career.totalWins}</b><br>
 初当たり平均 <b>${firstHitRate?firstHitRate.toFixed(1):'-'}</b>回 / 最高連荘 <b>${career.bestChain}</b><br>
 7ブル的中率 <b>${(buzzRate*100).toFixed(1)}%</b> / 最高到達 第${career.maxFloor}層`;
 const c=el.dataChart,ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
 const pts=career.graph;if(!pts.length)return;
 const vals=pts.map(x=>x.diff),min=Math.min(...vals,0),max=Math.max(...vals,0),span=Math.max(1,max-min);
 ctx.strokeStyle='#68e8ff';ctx.lineWidth=2;ctx.beginPath();
 pts.forEach((p,i)=>{const x=8+i*(c.width-16)/Math.max(1,pts.length-1);const y=c.height-8-(p.diff-min)*(c.height-16)/span;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
 ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.25)';ctx.beginPath();
 const zeroY=c.height-8-(0-min)*(c.height-16)/span;ctx.moveTo(0,zeroY);ctx.lineTo(c.width,zeroY);ctx.stroke();
}
function renderCatalog(){
 const cats={assist:'参戦',seven:'7テン',anomaly:'違和感',revival:'復活',allround:'全回転',rush:'RUSH',premium:'プレミア'};
 const all=[...window.SAO_LAWS];
 const found=career.lawFound;
 let html='';
 for(const [cat,label] of Object.entries(cats)){
  html+=`<div class="catalogCat">${label}</div>`;
  for(const law of all.filter(x=>x.category===cat)){
   const f=found.includes(law.id);
   html+=`<div class="catalogItem ${f?'found':'locked'}"><span>${f?'✓':'?'} ${f?law.label:'未発見'}</span><span>${law.rarity||''}</span></div>`;
  }
 }
 html+=`<div class="catalogCat">SECRET</div>`;
 for(const law of HIDDEN_LAWS){
  const f=career.secretFound.includes(law.id);
  html+=`<div class="catalogItem ${f?'found':'locked'}"><span>${f?'✓ '+law.name:'? SECRET'}</span><span>${law.tier}</span></div>`;
 }
 el.catalogList.innerHTML=html;
 el.catalogSummary.textContent=`NORMAL ${found.length}/${window.SAO_LAWS.length} / SECRET ${career.secretFound.length}/${HIDDEN_LAWS.length}`;
}
function discoverSecret(law){
 if(!law)return;
 if(!career.secretFound.includes(law.id)){career.secretFound.push(law.id);checkAchievements()}
}
loadSettings();safeLoad();applySettingsUI();
function currentRate(){return state.lightning?CFG.lightningRate:(state.rush?CFG.rushRate:CFG.normalRate)}
function missProbForTarget(pHit,target,base=currentRate()){
  if(target>=1)return 0;
  const q=(base*pHit*(1-target))/(target*(1-base));
  return Math.max(0,Math.min(1,q));
}
function eventByReliability(hit,pHit,target){return Math.random()<(hit?pHit:missProbForTarget(pHit,target))}
function currentStage(){return STAGES.find(s=>state.floor>=s.min&&state.floor<=s.max)||STAGES[0]}
function updateStage(){el.stage.textContent=currentStage().name}

function replayClass(node,cls='play'){
  if(!node)return;node.classList.remove(cls);void node.offsetWidth;node.classList.add(cls);
}
function slashVisual(){psycho('slash');if(effectAllowed('normal'))replayClass(el.slashFx)}
function assistVisual(name){if(!effectAllowed('normal')||!el.assistCutin)return;el.assistName.textContent=name||'ASSIST';replayClass(el.assistCutin)}
function bossVisual(name){if(!effectAllowed('major')||!el.bossScene)return;el.bossTitleFx.textContent=name||'FLOOR BOSS';replayClass(el.bossScene)}
function bonusVisual(title,count=''){if(!effectAllowed('major')||!el.bonusScene)return;el.bonusTitleFx.textContent=title;el.bonusCountFx.textContent=count;replayClass(el.bonusScene)}
function rushVisual(title){if(!effectAllowed('major')||!el.rushScene)return;el.rushTitleFx.textContent=title;replayClass(el.rushScene)}
function cut(text,dur=750){el.skillCutin.textContent=text;el.skillCutin.style.animation='none';void el.skillCutin.offsetWidth;el.skillCutin.style.animation=`skill ${dur}ms ease-out`}
function flash(color){el.flash.style.background=color;el.flash.style.animation='none';void el.flash.offsetWidth;el.flash.style.animation='flash .5s ease-out'}
function vibrate(pattern){if(navigator.vibrate)navigator.vibrate(pattern)}
function setText(a,b){el.msg.textContent=a;el.sub.textContent=b||''}

function ui(){
  el.balls.textContent=state.balls;el.spins.textContent=state.spins;el.wins.textContent=state.wins;el.best.textContent=state.best;
  el.stLeft.textContent=state.st;el.floor.textContent=state.floor;updateStage();
  if(el.result.style.display==='grid')updateResult();
}
function updateResult(){
  el.resSpins.textContent=state.spins;el.resWins.textContent=state.wins;el.resBest.textContent=state.best;
  const d=state.balls-CFG.startBalls;el.resDiff.textContent=(d>=0?'+':'')+d;
}
function paintHolds(){
  holds.forEach((h,i)=>{h.className='hold';if(state.queue[i])h.classList.add(state.queue[i].color)});
}

function createHold(){
  const rate=currentRate();
  const hit=Math.random()<rate;
  let color='on';
  if(eventByReliability(hit,CFG.features.goldHold.hit,CFG.features.goldHold.target))color='gold';
  else if(eventByReliability(hit,CFG.features.redHold.hit,CFG.features.redHold.target))color='red';
  return {hit,color,rateAtEntry:rate,modeAtEntry:state.lightning?'lightning':state.rush?'rush':'normal'};
}
function queueSpin(){
  if(state.queue.length>=CFG.holdMax)return;
  sfx('start',.55);state.queue.push(createHold());paintHolds();
  if(!state.spinning&&!state.roundPlaying)nextSpin();
}
function nextSpin(){
  if(!state.queue.length||state.spinning||state.roundPlaying)return;
  const hold=state.queue.shift();paintHolds();runSpin(hold);
}

function pickRoute(hit){
  if(hit){
    const r=Math.random();
    if(r<.05)return 'premium'; if(r<.17)return 'mystery'; if(r<.41)return 'dual';
    if(r<.66)return 'boss'; if(r<.86)return 'switch'; if(r<.96)return 'chance'; return 'quiet';
  }
  const r=Math.random();
  if(r<.78)return 'quiet'; if(r<.94)return 'chance'; if(r<.985)return 'switch'; if(r<.997)return 'boss'; if(r<.9995)return 'dual'; return 'mystery';
}
const ROUTE_NAME={quiet:'静寂ルート',chance:'チャンスルート',switch:'SWITCHルート',boss:'ボス強襲ルート',dual:'二刀流ルート',mystery:'違和感ルート',premium:'プレミアルート'};
const HIDDEN_LAWS=[
 {id:'asuna_7_dual',name:'閃光と黒の剣士',desc:'アスナ参戦＋7テン＋二刀流',tier:'jackpot',hitOnly:true,match:p=>p.assist==='アスナ'&&p.sevenTempai&&p.dual},
 {id:'klein_no_switch',name:'クラインの違和感',desc:'クライン参戦なのにSWITCH非発生',tier:'hot',match:p=>p.assist==='クライン'&&!p.switchOn&&p.route!=='quiet'},
 {id:'agil_quiet',name:'商人の確信',desc:'エギル参戦＋静寂ルート',tier:'hot',match:p=>p.assist==='エギル'&&p.route==='quiet'},
 {id:'silica_red',name:'小竜の導き',desc:'シリカ参戦＋赤保留',tier:'hot',match:p=>p.assist==='シリカ'&&p.hold.color==='red'},
 {id:'lisbeth_gold',name:'鍛冶師の一撃',desc:'リズベット参戦＋金保留',tier:'jackpot',hitOnly:true,match:p=>p.assist==='リズベット'&&p.hold.color==='gold'},
 {id:'floor75_mystery',name:'第75層の違和感',desc:'75層以上＋違和感ルート',tier:'jackpot',hitOnly:true,match:p=>p.floor>=75&&p.route==='mystery'},
 {id:'floor100_premium',name:'最終到達',desc:'100層＋プレミアルート',tier:'premium',hitOnly:true,match:p=>p.floor===100&&p.route==='premium'},
 {id:'seven_no_blue',name:'静かな7',desc:'7テン＋変動開始7ブル無し',tier:'hot',match:p=>p.sevenTempai&&!p.sevenKind},
 {id:'redblue_asuna',name:'閃光激震',desc:'赤7ブル＋アスナ参戦',tier:'premium',hitOnly:true,match:p=>p.sevenKind==='red'&&p.assist==='アスナ'},
 {id:'zebra_any',name:'絶対的違和感',desc:'ゼブラ7ブル',tier:'premium',hitOnly:true,match:p=>p.sevenKind==='zebra'},
 {id:'episode_asuna',name:'約束の記憶',desc:'エピソード＋アスナ参戦',tier:'jackpot',hitOnly:true,match:p=>p.episode&&p.assist==='アスナ'},
 {id:'allround_75',name:'決戦の記憶',desc:'75層以上＋全回転',tier:'premium',hitOnly:true,match:p=>p.floor>=75&&p.allround},
 {id:'rush_last_notice',name:'残り1回の告知',desc:'RUSH残り1回＋完全告知',tier:'hot',match:p=>p.rush&&p.stAtStart<=1&&p.rushStyle==='notice'},
 {id:'lightning_red',name:'雷光激震',desc:'LIGHTNING RUSH＋赤7ブル',tier:'premium',hitOnly:true,match:p=>p.lightning&&p.sevenKind==='red'},
 {id:'quiet_gold',name:'静寂の金',desc:'静寂ルート＋金保留',tier:'hot',match:p=>p.route==='quiet'&&p.hold.color==='gold'},
 {id:'boss_noassist',name:'孤高の攻略',desc:'ボス強襲＋助っ人無し',tier:'hot',match:p=>p.route==='boss'&&!p.assist},
 {id:'dual_noassist',name:'ソロ二刀流',desc:'二刀流＋助っ人無し',tier:'jackpot',hitOnly:true,match:p=>p.dual&&!p.assist},
 {id:'switch_asuna',name:'完璧なSWITCH',desc:'SWITCH＋アスナ参戦',tier:'hot',match:p=>p.switchOn&&p.assist==='アスナ'},
 {id:'mystery_seven',name:'停止図柄の矛盾',desc:'違和感＋7テン',tier:'jackpot',hitOnly:true,match:p=>p.route==='mystery'&&p.sevenTempai},
 {id:'episode_redblue',name:'記憶の激震',desc:'エピソード＋赤7ブル',tier:'premium',hitOnly:true,match:p=>p.episode&&p.sevenKind==='red'},
 {id:'rush_switch_blue',name:'高速SWITCH',desc:'RUSH中SWITCH＋7ブル',tier:'hot',match:p=>p.rush&&p.switchOn&&!!p.sevenKind},
 {id:'lightning_notice',name:'雷光完全告知',desc:'LIGHTNING RUSH＋完全告知',tier:'hot',match:p=>p.lightning&&p.rushStyle==='notice'},
 {id:'floor1_asuna',name:'はじまりの共闘',desc:'第1層＋アスナ参戦',tier:'hot',match:p=>p.floor===1&&p.assist==='アスナ'},
 {id:'revival_7',name:'7の復活',desc:'7テンから復活',tier:'jackpot',hitOnly:true,match:p=>p.sevenTempai&&p.revivalOn}
];
let hiddenLawHits=0,lastHiddenLaw=null;
function hiddenLawPick(plan){
  const pool=HIDDEN_LAWS.filter(x=>(!x.hitOnly||plan.hit)&&x.match(plan));
  if(!pool.length)return null;
  const law=pool[Math.floor(Math.random()*pool.length)];
  hiddenLawHits++;lastHiddenLaw=law;
  return law;
}
function showHiddenLaw(law){
  if(!el.hiddenLawBadge)return;
  if(!law){el.hiddenLawBadge.textContent='';el.hiddenLawBadge.className='';return;}
  el.hiddenLawBadge.textContent=`SECRET: ${law.name}`;
  el.hiddenLawBadge.className='secret';
}



const FLOW_STAGES=['保留','先読み','変動開始','連続予告','キャラ/ステージ','SP発展','ボス/二刀流','当落','復活'];
function flowSet(label,pct,cls=''){
 if(el.flowStep)el.flowStep.textContent=label;
 if(el.flowBar)el.flowBar.querySelector('i').style.width=`${Math.max(0,Math.min(100,pct))}%`;
 document.body.classList.remove('flow-pre','flow-sp','flow-final');
 if(cls)document.body.classList.add(cls);
}
function buildNormalFlow(plan){
 let pseudo=0;
 if(plan.hit){
   if(plan.route==='dual'||plan.route==='premium')pseudo=Math.random()<.55?2:1;
   else if(['boss','switch'].includes(plan.route))pseudo=Math.random()<.42?1:0;
 }else{
   if(plan.route==='chance'&&Math.random()<.18)pseudo=1;
   if(plan.route==='switch'&&Math.random()<.28)pseudo=1;
 }
 const titleColor=plan.hit?(plan.dual||plan.episode?'gold':plan.bossOn?'red':'white'):(Math.random()<.12?'red':'white');
 const subtitleColor=plan.hit&&Math.random()<.42?'red':Math.random()<.08?'red':'white';
 const finalDevice=plan.sevenKind?'7BLUE':plan.dual?'DUAL':plan.bossOn?'PUSH':'NORMAL';
 const routeLabel=plan.allround?'ALL ROUND':plan.episode?'EPISODE':plan.dual?'DUAL BLADES':plan.bossOn?'BOSS':plan.switchOn?'SWITCH':plan.route.toUpperCase();
 return {
   pseudo,titleColor,subtitleColor,finalDevice,routeLabel,
   preRead:!!(plan.linkAlert||plan.hold.color!=='on'||plan.sevenTempai),
   sp:!!(plan.switchOn||plan.bossOn||plan.dual||plan.episode||plan.allround),
   climax:!!(plan.bossOn||plan.dual||plan.episode||plan.allround)
 };
}
function buildSpinPlan(hold){
  const hit=hold.hit; // outcome is fixed at START entry. Presentation never changes it.
  let route=pickRoute(hit);
  if(hold.color==='gold'&&['quiet','chance'].includes(route))route='dual';
  else if(hold.color==='red'&&route==='quiet')route='boss';

  const sevenTempai=eventByReliability(hit,CFG.features.sevenTempai.hit,CFG.features.sevenTempai.target);
  const episode=eventByReliability(hit,CFG.features.episode.hit,CFG.features.episode.target);
  const switchOn=eventByReliability(hit,CFG.features.switch.hit,CFG.features.switch.target)||['switch','boss','dual','premium'].includes(route);
  const bossOn=eventByReliability(hit,CFG.features.boss.hit,CFG.features.boss.target)||['boss','dual','premium'].includes(route);
  const dual=eventByReliability(hit,CFG.features.dual.hit,CFG.features.dual.target)||['dual','premium'].includes(route);
  let assist=null;
  const stage=currentStage();
  if(eventByReliability(hit,CFG.features.asunaAssist.hit,CFG.features.asunaAssist.target))assist='アスナ';
  else if(route!=='quiet'&&Math.random()<.32)assist=stage.assist[Math.floor(Math.random()*stage.assist.length)];

  const allround=hit&&(route==='premium'||Math.random()<.035);
  const linkAlert=eventByReliability(hit,CFG.features.linkAlert.hit,CFG.features.linkAlert.target);

  let sevenKind=null;
  if(state.sevenMode!=='off'){
    if(hit){
      const roll=Math.random();
      const redP=state.sevenMode==='redup'?CFG.seven.redupRedHit:CFG.seven.redHit;
      if(roll<CFG.seven.zebraHit)sevenKind='zebra';
      else if(roll<CFG.seven.zebraHit+redP)sevenKind='red';
      else if(roll<CFG.seven.zebraHit+redP+CFG.seven.hitBlue)sevenKind='blue';
    }else if(Math.random()<missProbForTarget(CFG.seven.hitBlue,CFG.seven.targetBlue,hold.rateAtEntry))sevenKind='blue';
  }
  const laws=[];
  if(assist)laws.push(lawPick('assist',{hit,character:assist}));
  if(sevenTempai)laws.push(lawPick('seven',{hit}));
  if(route==='mystery')laws.push(lawPick('anomaly',{hit}));
  if(allround)laws.push(lawPick('allround',{hit:true}));
  if(state.rush)laws.push(lawPick('rush',{hit,mode:state.rushStyle==='battle'?'バトル':state.rushStyle==='impact'?'一撃':'完全告知'}));
  if(route==='premium'||sevenKind==='red'||sevenKind==='zebra')laws.push(lawPick('premium',{hit:true}));
  const revivalOn=hit&&!allround&&Math.random()<CFG.revival;
  const revivalLaw=revivalOn?lawPick('revival',{hit:true}):null;
  if(revivalLaw)laws.push(revivalLaw);
  const plan={hit,route,sevenTempai,episode,switchOn,bossOn,dual,assist,allround,linkAlert,sevenKind,hold,
    laws:laws.filter(Boolean),revivalOn,revivalLaw,floor:state.floor,rush:state.rush,lightning:state.lightning,
    stAtStart:state.st,rushStyle:state.rushStyle};
  plan.hiddenLaw=hiddenLawPick(plan);
  plan.normalFlow=buildNormalFlow(plan);
  plan.instantHit=!!(plan.hit&&state.rush&&Math.random()<(state.lightning?.24:.12));
  plan.rushSecret=rushSecretPick(plan);
  return plan;
}

function sevenBlue(kind='blue'){psycho('seven');career.sevenBuzz++;if(state.spinning&&state.currentPlan&&state.currentPlan.hit)career.sevenBuzzHits++;checkAchievements();
  el.seven.classList.remove('blue7','red7','zebra7');void el.seven.offsetWidth;
  el.seven.classList.add(kind==='red'?'red7':kind==='zebra'?'zebra7':'blue7');
  vibrate(kind==='zebra'?[80,25,80,25,110,30,150]:kind==='red'?[70,30,70,30,120]:[45,25,45,25,80]);
  cut(kind==='zebra'?'ZEBRA 7 BLUE':kind==='red'?'RED 7 BLUE':'7 BLUE',kind==='zebra'?950:700);
  setTimeout(()=>el.seven.classList.remove('blue7','red7','zebra7'),kind==='zebra'?1500:1250);
}
function showBoss(plan){
  document.body.classList.remove('boss-theme-gleam','boss-theme-skull','boss-theme-kobold','boss-theme-final');
  let names,theme;
  if(state.floor>=100){names=['FINAL OVERLORD'];theme='boss-theme-final'}
  else if(state.floor>=75){names=['THE GLEAM EYES','75F DECISIVE BOSS'];theme='boss-theme-gleam'}
  else if(state.floor>=50){names=['SKULL REAPER','DEMON GENERAL'];theme='boss-theme-skull'}
  else{names=['KOBOLD LORD','FLOOR BOSS'];theme='boss-theme-kobold'}
  document.body.classList.add(theme);
  const name=names[Math.floor(Math.random()*names.length)];
  el.battleName.textContent=name;el.enemy.textContent=`《${name}》`;bossVisual(name);
  const approx=plan.dual?72:plan.episode?82:plan.bossOn?48:32;
  el.battleChance.textContent=`期待度 約${approx}%`;el.battleCard.classList.add('show');
  setTimeout(()=>el.battleCard.classList.remove('show'),1100);
}
function awaken(){slashVisual();el.awakening.classList.remove('show');void el.awakening.offsetWidth;el.awakening.classList.add('show');flash('#72eaff');vibrate([70,30,100,30,150])}

function resetSpinVisuals(){flowSet('READY',0);if(el.hiddenLawBadge){el.hiddenLawBadge.textContent='';el.hiddenLawBadge.className='';}
  document.body.classList.remove('special7','episodeMode','allroundMode','premiumFlash');
  el.hpBar.style.width='100%';el.enemy.style.animation='';el.assistLine.textContent='SOLO';showLaw(null);
}



const RUSH_EVOLUTION=[
 {min:0,stage:0,label:'LINK 0'},
 {min:5,stage:1,label:'LINK BURST'},
 {min:10,stage:2,label:'DUAL DRIVE'},
 {min:20,stage:3,label:'OVER LINK'},
 {min:30,stage:4,label:'SYSTEM OVERDRIVE'}
];
function rushEvolutionState(){
 let cur=RUSH_EVOLUTION[0];
 for(const x of RUSH_EVOLUTION)if(state.chain>=x.min)cur=x;
 return cur;
}
function applyRushEvolution(){
 const e=rushEvolutionState();
 document.body.classList.remove('rush-evo-1','rush-evo-2','rush-evo-3','rush-evo-4','rush-overdrive');
 if(state.rush&&e.stage>0)document.body.classList.add(`rush-evo-${e.stage}`);
 if(state.rush&&e.stage>=3)document.body.classList.add('rush-overdrive');
 if(el.rushEvolution){
  el.rushEvolution.style.display=state.rush?'block':'none';
  el.rushEvolutionLabel.textContent=e.label;
  const pct=Math.min(100,state.chain/30*100);
  el.rushEvolutionBar.querySelector('i').style.width=`${pct}%`;
 }
}
function evolutionCue(){
 const e=rushEvolutionState();
 if([5,10,20,30].includes(state.chain)){
  const msg={5:'LINK BURST',10:'DUAL DRIVE',20:'OVER LINK',30:'SYSTEM OVERDRIVE'}[state.chain];
  cut(msg,950);flash(state.chain>=20?'#fff2a0':'#b274ff');
  if(state.chain===10){musicPlay('dual',true,.12);slashVisual()}
  if(state.chain===20){sevenCinematic(state.lightning?'lightning':'rush')}
  if(state.chain===30){sevenCinematic('lightning');psycho('confirm')}
 }
 applyRushEvolution();
}
const RUSH_SECRET_LAWS=[
 {id:'last1_battle',name:'LAST ONE BATTLE',match:p=>p.rushStyle==='battle'&&p.stAtStart===1&&p.hit},
 {id:'last1_impact',name:'LAST ONE PUSH',match:p=>p.rushStyle==='impact'&&p.stAtStart===1&&p.hit},
 {id:'last1_notice',name:'LAST ONE COMPLETE',match:p=>p.rushStyle==='notice'&&p.stAtStart===1&&p.hit},
 {id:'lightning_red',name:'LIGHTNING RED BLUE',match:p=>p.lightning&&p.sevenKind==='red'&&p.hit},
 {id:'chain10',name:'TEN CHAIN',match:p=>state.chain===9&&p.hit},
 {id:'chain20',name:'TWENTY CHAIN',match:p=>state.chain===19&&p.hit},
 {id:'chain30',name:'THIRTY CHAIN',match:p=>state.chain===29&&p.hit},
 {id:'instant',name:'INSTANT LINK',match:p=>p.instantHit&&p.hit},
 {id:'revival',name:'RUSH REVIVAL',match:p=>p.revivalOn&&p.hit},
 {id:'upper',name:'UPPER GATE',match:p=>p.lightning&&p.hit}
 ,
 {id:'evo5',name:'LINK BURST SECRET',match:p=>state.chain===4&&p.hit},
 {id:'evo10',name:'DUAL DRIVE SECRET',match:p=>state.chain===9&&p.hit},
 {id:'evo20',name:'OVER LINK SECRET',match:p=>state.chain===19&&p.hit},
 {id:'evo30',name:'SYSTEM OVERDRIVE SECRET',match:p=>state.chain===29&&p.hit}
];
function rushSecretPick(plan){
 const pool=RUSH_SECRET_LAWS.filter(x=>x.match(plan));
 return pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
}
function rushRemainingCue(){
 if(!state.rush||!el.rushMilestone)return;
 const n=state.st;
 let label='';
 if([50,20,10,5,1].includes(n))label=`残り ${n}`;
 el.rushMilestone.textContent=label;
 el.rushMilestone.style.display=label?'block':'none';
}
function chainMilestoneCue(){
 if([10,20,30].includes(state.chain)){
  cut(`${state.chain} CHAIN`,900);flash(state.chain>=30?'#fff6a3':'#b56cff');
 }
}
function setRushTheme(){applyRushEvolution();
 document.body.classList.remove('rush-battle','rush-impact','rush-notice','lightningMode');
 if(state.rush){
  document.body.classList.add(state.rushStyle==='battle'?'rush-battle':state.rushStyle==='impact'?'rush-impact':'rush-notice');
  if(state.lightning)document.body.classList.add('lightningMode');
 }
}
function rushPresentation(plan,phase){
 if(!state.rush)return false;
 setRushTheme();
 rushRemainingCue();
 if(el.rushSecret)el.rushSecret.textContent=plan.rushSecret?`SECRET: ${plan.rushSecret.name}`:'';

 if(plan.instantHit){
  if(phase===3){setText('INSTANT LINK','即当たり');sevenBlue(plan.sevenKind==='red'?'red':'blue');flash('#fff');}
  if(phase>=6){finishSpin(plan);return true;}
  return true;
 }

 if(state.rushStyle==='battle'){
  if(phase===4){const e=rushEvolutionState();el.sceneTitle.textContent=state.lightning?'LIGHTNING BATTLE':e.stage>=3?'OVER LINK BATTLE':'RUSH BATTLE';if(e.stage>=2)slashVisual();}
  if(phase===6){
    showBoss(plan);el.msg.textContent='RUSH BATTLE';
    el.hpBar.style.width=plan.hit?'64%':'82%';
  }
  if(phase===9&&plan.switchOn){cut('SWITCH!',420);slashVisual();el.hpBar.style.width=plan.hit?'42%':'66%';}
  if(phase===12&&plan.hit){cut('FINAL ATTACK',520);slashVisual();el.hpBar.style.width='10%';}
  if(phase===15&&!plan.hit){el.sub.textContent='ENEMY COUNTER';}
  if(phase>=18){finishSpin(plan);return true;}
  return true;
 }

 if(state.rushStyle==='impact'){
  if(phase===3){el.sceneTitle.textContent=state.lightning?'LIGHTNING IMPACT':'ONE SHOT';}
  if(phase===5&&rushEvolutionState().stage>=2&&plan.hit){psycho('push');flash('#fff06d');}
  if(phase===7){
    setText('PUSH','一撃で決めろ');
    cut(plan.hit?'PUSH NOW':'PUSH',520);
    if(plan.sevenKind)sevenBlue(plan.sevenKind);
  }
  if(phase===11){
    if(plan.hit){slashVisual();flash('#ffffff');}
    else{flash('#4b5363');el.sub.textContent='NO RESPONSE';}
  }
  if(phase>=14){finishSpin(plan);return true;}
  return true;
 }

 if(state.rushStyle==='notice'){
  if(phase===2){const e=rushEvolutionState();el.sceneTitle.textContent=state.lightning?'LIGHTNING NOTICE':e.stage>=3?'SILENT OVERDRIVE':'SILENT MODE';if(e.stage>=3&&plan.hit)el.sub.textContent='…';}
  if(phase<10){setText('高速変動','……');}
  if(phase===10&&plan.hit){
    if(plan.sevenKind==='red'||state.lightning){sevenBlue('red');}
    else sevenBlue('blue');
    psycho('confirm');cut('COMPLETE',620);flash('#ffffff');
  }
  if(phase>=12){finishSpin(plan);return true;}
  return true;
 }
 return false;
}

function runSpin(hold){
  state.spinning=true;if(state.rush)state.st=Math.max(0,state.st-1);else state.spins++;career.totalSpins++;career.maxFloor=Math.max(career.maxFloor,state.floor);checkAchievements();ui();resetSpinVisuals();
  const plan=buildSpinPlan(hold);state.currentPlan=plan;el.routeTag.textContent=ROUTE_NAME[plan.route];showLaw(plan.laws[0]||null);discoverLaw(plan.laws[0]||null);showHiddenLaw(plan.hiddenLaw);discoverSecret(plan.hiddenLaw);
  if(plan.assist){el.assistLine.textContent=`${plan.assist} 参戦`;assistVisual(plan.assist);}
  if(plan.sevenTempai)document.body.classList.add('special7');if(plan.episode)document.body.classList.add('episodeMode');if(plan.allround)document.body.classList.add('allroundMode');
  el.sceneTitle.textContent=state.rush?(state.lightning?'LIGHTNING RUSH':'SWORD RUSH'):'AINCRAD FIELD';

  if(plan.sevenKind){sevenBlue(plan.sevenKind);setText(plan.sevenKind==='zebra'?'ZEBRA 7 BLUE':plan.sevenKind==='red'?'RED 7 BLUE':'7 BLUE',plan.sevenKind==='blue'?'大チャンス':'大当たり濃厚');flash(plan.sevenKind==='blue'?'#56e0ff':plan.sevenKind==='red'?'#ff3150':'#fff6b3');}
  else if(plan.linkAlert){setText('LINK ALERT',plan.hit?'期待度 約45%':'WARNING');flash('#56e0ff');vibrate([30,40,70]);}
  else setText(state.rush?(state.rushStyle==='battle'?'DUEL START':state.rushStyle==='impact'?'一撃待機':'告知待機'):'LINK START','');

  let phase=0;
  const timer=setInterval(()=>{
    reels.forEach(r=>r.textContent=String(1+Math.floor(Math.random()*9)));
    phase++;

    const rushHandled=rushPresentation(plan,phase);
    if(rushHandled){if(!state.spinning)clearInterval(timer);return;}

    const nf=plan.normalFlow;

    if(phase===2){
      flowSet('保留',10,'flow-pre');
      if(plan.hold.color==='gold'){el.sub.textContent='金保留';flash('#ffd85e');}
      else if(plan.hold.color==='red'){el.sub.textContent='赤保留';flash('#ff4965');}
    }
    if(phase===4){
      flowSet('先読み',20,'flow-pre');
      if(plan.sevenTempai){reels[0].textContent='7';reels[1].textContent='7';el.sub.textContent='7テン煽り';}
      if(plan.linkAlert&&!plan.sevenKind){psycho('prealert');setText('LINK ALERT',plan.hit?'期待度 約45%':'WARNING');}
    }
    if(phase===6){
      flowSet('変動開始',32,'flow-pre');
      el.sceneTitle.textContent=nf.routeLabel;
      if(plan.allround){cut('MEMORY FRAGMENT',850);el.sub.textContent='全回転への扉';}
      else if(plan.episode){cut('EPISODE LINK',700);el.sub.textContent='記憶が繋がる';}
    }
    if(phase===8&&nf.pseudo>0){
      flowSet('連続予告',43,'flow-pre');
      cut(`LINK ×${nf.pseudo+1}`,520);
      el.sub.textContent=`連続予告 ${nf.pseudo+1}回`;
    }
    if(phase===10){
      flowSet('キャラ/ステージ',52,nf.sp?'flow-sp':'flow-pre');
      if(plan.assist){assistVisual(plan.assist);cut(`${plan.assist}\nASSIST`,620);el.sub.textContent=`${plan.assist}参戦`;if(plan.laws[0]){showLaw(plan.laws[0]);discoverLaw(plan.laws[0]);}}
      else if(!plan.sp){el.sub.textContent=`FLOOR ${state.floor}`;}
    }
    if(phase===12&&plan.switchOn){
      musicPlay('sp');flowSet('SP発展',62,'flow-sp');
      cut('SWITCH!',520);slashVisual();
      el.sub.textContent=plan.assist?`${plan.assist}とSWITCH`:'SWITCH発展';
    }
    if(phase===14&&nf.sp){
      musicPlay(plan.dual?'dual':'sp');flowSet('SP発展',70,'flow-sp');
      el.sceneTitle.textContent=plan.episode?'EPISODE SP':plan.dual?'DUAL BLADES SP':plan.bossOn?'BOSS SP':'SWORD SKILL';
      el.sub.textContent=`TITLE ${nf.titleColor.toUpperCase()} / TEXT ${nf.subtitleColor.toUpperCase()}`;
      if(plan.episode&&plan.laws[1]){showLaw(plan.laws[1]);discoverLaw(plan.laws[1]);}
    }
    if(phase===16&&nf.climax){
      flowSet('ボス/二刀流',80,'flow-final');
      if(plan.bossOn)showBoss(plan);
      if(plan.dual)awaken();
      if(plan.episode){cut('PROMISE\nSLASH',720);slashVisual();}
      el.hpBar.style.width=plan.hit?'28%':'52%';
    }
    if(phase===18){
      flowSet('当落',92,'flow-final');
      if(plan.sevenKind&&!state.rush){
        sevenBlue(plan.sevenKind);
        el.sub.textContent=plan.sevenKind==='blue'?'7ブル・大チャンス':'7ブル・大当たり濃厚';
      }else if(nf.finalDevice==='PUSH'){
        psycho('push');cut('PUSH',500);el.sub.textContent='最終ボタン';
      }else if(nf.finalDevice==='DUAL'){
        cut('FINAL ATTACK',520);slashVisual();
      }
      if(plan.hit)el.hpBar.style.width='8%';
    }
    if(phase===20&&plan.allround){
      flowSet('全回転',98,'flow-final');
      psycho('confirm');cut('ALL MEMORY\nLINK',900);flash('#fff6b3');
    }

    if(phase>=22){
      clearInterval(timer);
      finishSpin(plan);
    }
  },state.rush?38:66);
}

function finishSpin(plan){if(el.rushSecret)el.rushSecret.textContent='';if(!state.rush&&!plan.hit)musicPlay('normal',true,.3);
  document.body.classList.remove('premiumFlash');
  if(plan.hit){
    if(state.rush&&state.rushStyle==='notice'){sevenBlue('red');cut('告知\nCOMPLETE',700);flash('#fff');}
    if(plan.revivalOn){flowSet('復活',100,'flow-final');reels[0].textContent='7';reels[1].textContent='7';reels[2].textContent='8';setText('MISSION FAILED','……');el.hpBar.style.width='8%';setTimeout(()=>{const label=plan.revivalLaw?plan.revivalLaw.label:'SYSTEM RECONNECT';showLaw(plan.revivalLaw);cut(label.replace(/ /g,'\n'),750);flash('#72eaff');setText('REVIVAL','復活の一撃');setTimeout(()=>{reels.forEach(r=>r.textContent='7');el.hpBar.style.width='0%';setText('BOSS DEFEATED','777');jackpot(plan);},850);},700);}
    else{reels.forEach(r=>r.textContent='7');el.hpBar.style.width='0%';setText(plan.allround?'ALL MEMORY COMPLETE':'BOSS DEFEATED','777');flash('#fff');setTimeout(()=>jackpot(plan),450);}
  }else{
    let a=String(1+Math.floor(Math.random()*9)),b=String(1+Math.floor(Math.random()*9)),c=String(1+Math.floor(Math.random()*9));
    if((plan.hold.color==='red'||plan.hold.color==='gold'||plan.dual)&&Math.random()<.72){a=b='7';c=Math.random()<.5?'6':'8';setText('LAST ATTACK FAILED','激アツ外れ');}
    else setText('MISS',plan.route==='quiet'?'静かな変動':'');
    reels[0].textContent=a;reels[1].textContent=b;reels[2].textContent=c;
    setTimeout(()=>{state.spinning=false;resetSpinVisuals();if(state.rush&&state.st===0)endRush();else{setText(state.rush?'DUEL CONTINUE':'LINK START',state.rush?'残りSTを消化':'スタート入賞で変動');nextSpin();}},650);
  }
}

function jackpot(plan){sevenCinematic('jackpot');psycho('jackpot');flowSet('大当たり',100,'flow-final');
  resetSpinVisuals();bonusVisual(plan.allround||plan.route==='premium'?'3000 OVER DRIVE':'SWORD BONUS','777');state.wins++;career.totalWins++;career.bestChain=Math.max(career.bestChain,state.chain+1);recordHistory('大当たり',{chain:state.chain+1});addGraphPoint();checkAchievements();state.chain++;state.best=Math.max(state.best,state.chain);chainMilestoneCue();evolutionCue();state.roundPlaying=true;ui();
  const premium=plan.allround||plan.route==='premium'||Math.random()<CFG.premium3000;if(state.rush&&premium)cut('RUSH 3000\nUPGRADE',850);
  setText(premium?'PREMIUM BONUS 3000':'SWORD BONUS',premium?'3000 BONUS':'10R BONUS');cut(premium?'3000\nOVER DRIVE':'SWORD\nBONUS',1000);
  let total=premium?20:10,round=1;
  const timer=setInterval(()=>{state.balls+=150;career.totalBallsWon+=150;saveGame();ui();setText(`ROUND ${round}/${total}`,'+150玉');if(round%5===0){state.floor=Math.min(100,state.floor+1);ui();}round++;if(round>total){clearInterval(timer);setTimeout(afterBonus,500);}},165);
}
function afterBonus(){
  state.roundPlaying=false;state.spinning=false;
  if(!state.rush){if(Math.random()<CFG.rushEntry)startRush();else{state.chain=0;setText('LOG OUT','RUSH突入ならず');setTimeout(()=>{setText('LINK START','スタート入賞で変動');nextSpin();},900);}}
  else{if(!state.lightning&&Math.random()<CFG.upperEntry){state.lightning=true;state.st=CFG.st;setRushTheme();sevenCinematic('lightning');psycho('rush');rushVisual('LIGHTNING RUSH');el.mode.textContent='LIGHTNING RUSH 1/12.8';el.sceneTitle.textContent='LIGHTNING RUSH';setText('LIGHTNING RUSH','上位RUSH LINK');cut('LIGHTNING\nBURST',1000);flash('#fff4a0');}else{state.st=CFG.st;setText(state.lightning?'LIGHTNING CONTINUE':'RUSH CONTINUE','ST100回 再セット');cut('BURST\nCONTINUE',700);}ui();setTimeout(nextSpin,650);}
}
function startRush(){sevenCinematic('rush');psycho('rush');applyRushEvolution();rushVisual('SWORD RUSH');career.rushEntries++;recordHistory('SWORD RUSH');checkAchievements();state.rush=true;state.lightning=false;state.st=CFG.st;setRushTheme();document.body.classList.add('rush');el.rushCounter.style.display='block';el.mode.textContent='SWORD RUSH 1/29.9';el.sceneTitle.textContent='SWORD RUSH';setText('RUSH LINK','ST100回・高速右打ち');cut('SWORD RUSH\nLINK START',1000);flash('#b56cff');ui();setTimeout(nextSpin,1000);}
function endRush(){addGraphPoint();state.rush=false;state.lightning=false;setRushTheme();applyRushEvolution();musicPlay('normal',true,.35);state.st=0;state.chain=0;document.body.classList.remove('rush');el.rushCounter.style.display='none';el.mode.textContent='AINCRAD MODE 1/199';el.sceneTitle.textContent='AINCRAD FIELD';setText('RUSH END','通常時へ');ui();setTimeout(()=>{setText('LINK START','スタート入賞で変動');nextSpin();},900);}


function demoStep(){
 if(state.spinning||state.roundPlaying)return;
 const r=Math.random();
 if(r<.18){sevenBlue(Math.random()<.18?'red':'blue');setText('7 BLUE','DEMO');}
 else if(r<.36){assistVisual(['アスナ','クライン','エギル','シリカ','リズベット'][Math.floor(Math.random()*5)]);cut('SWITCH!',600);slashVisual();}
 else if(r<.54){bossVisual('THE GLEAM EYES');cut('BOSS BATTLE',700);}
 else if(r<.70){bonusVisual('3000 OVER DRIVE','DEMO');}
 else if(r<.86){rushVisual(Math.random()<.5?'SWORD RUSH':'LIGHTNING RUSH');}
 else{cut('DUAL BLADES\nAWAKENING',900);slashVisual();}
}
function setDemo(on){
 demoMode=!!on;document.body.classList.toggle('demoMode',demoMode);
 el.demoBtn.innerHTML=`DEMO<br>${demoMode?'ON':'OFF'}`;
 if(demoTimer){clearInterval(demoTimer);demoTimer=null}
 if(demoMode)demoTimer=setInterval(demoStep,1800);
}

function resize(){const r=el.game.getBoundingClientRect();state.W=r.width;state.H=r.height;el.canvas.width=state.W*state.dpr;el.canvas.height=state.H*state.dpr;ctx.setTransform(state.dpr,0,0,state.dpr,0,0);buildPins()}
function buildPins(){state.pins=[];const top=state.H*.50,bottom=state.H*.77,rows=7;for(let r=0;r<rows;r++)for(let c=0;c<7;c++){const x=state.W*(.14+(c+(r%2?.5:0))*(.72/7)),y=top+r*((bottom-top)/rows);if(!(Math.abs(x-state.W*.5)<27&&r>3))state.pins.push({x,y,r:3.5});}state.pins.push({x:state.W*.43,y:state.H*.75,r:4.5},{x:state.W*.57,y:state.H*.75,r:4.5});for(let i=0;i<5;i++){pins.push({x:state.W*(.36+i*.07),y:state.H*(.69+i*.012),r:3.2})};}
function shoot(){if(state.balls<=0){setText('NO COIN','持ち玉がありません');return;}sfx('shot',.18);state.balls--;ui();const right=state.rush;state.shots.push({x:right?state.W*.10:state.W*.90,y:state.H*.92,vx:right?(2.4+Math.random()*1.35):(-2.4-Math.random()*1.35),vy:-9.7-Math.random()*2.0,r:5,spin:(Math.random()-.5)*.08,active:true});}
function collide(b,p){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),m=b.r+p.r;if(d>0&&d<m){const nx=dx/d,ny=dy/d;b.x=p.x+nx*m;b.y=p.y+ny*m;const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=1.65*dot*nx;b.vy-=1.65*dot*ny;}b.vx*=.885;b.vy*=.885;b.vx+=(Math.random()-.5)*.45;}}
function physics(){for(const b of state.shots){if(!b.active)continue;b.vy+=.235;b.vx*=.998;b.vy*=.999;b.vx+=b.spin;b.x+=b.vx;b.y+=b.vy;if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*.78;}if(b.x>state.W-b.r){b.x=state.W-b.r;b.vx=-Math.abs(b.vx)*.78;}state.pins.forEach(p=>collide(b,p));const cx=state.W*.5,cy=state.H*.81;if(Math.hypot(b.x-cx,b.y-cy)<16+b.r){b.active=false;b.y=state.H+50;queueSpin();}if(b.y>state.H+30)b.active=false;}state.shots=state.shots.filter(b=>b.active||b.y<=state.H);}
function draw(){ctx.clearRect(0,0,state.W,state.H);ctx.strokeStyle='rgba(83,219,255,.65)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(state.W*.5,state.H*.58,Math.min(state.W*.44,state.H*.37),0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d9f9ff';state.pins.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});const cx=state.W*.5,cy=state.H*.81;ctx.fillStyle='#55dcff';ctx.beginPath();ctx.arc(cx,cy,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#07131b';ctx.beginPath();ctx.arc(cx,cy,8.5,0,Math.PI*2);ctx.fill();ctx.fillStyle=state.rush?'#c47cff':'#53dfff';ctx.beginPath();ctx.arc(state.rush?state.W*.10:state.W*.90,state.H*.92,9,0,Math.PI*2);ctx.fill();state.shots.forEach(b=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8cdfff';ctx.stroke();});}
function loop(ts){if(state.firing&&ts-state.lastShot>CFG.shotInterval){shoot();state.lastShot=ts;}physics();draw();requestAnimationFrame(loop)}
function beginFire(e){startBgm();if(e&&e.cancelable)e.preventDefault();if(!state.firing){state.firing=true;shoot();state.lastShot=performance.now();}}
function endFire(e){if(e&&e.cancelable)e.preventDefault();state.firing=false}

function setSevenMode(mode){state.sevenMode=mode;customButtons.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));el.custom.innerHTML=mode==='off'?'7ブル<br>OFF':mode==='redup'?'赤7ブル<br>UP':'7ブル<br>ON';el.sub.textContent=mode==='off'?'7ブル演出 OFF':mode==='redup'?'赤7ブル出現率UP':'7ブル待ちモード';el.customPanel.style.display='none';}
function setRushStyleUI(){el.rushStyle.innerHTML=`RUSH<br>${state.rushStyle==='battle'?'バトル':state.rushStyle==='impact'?'一撃':'告知'}`}
function buildReliabilityTable(){
  const rows=[['演出法則データ',`${LAW_LIBRARY.length}種`],['LINK ALERT','約45%'],['赤保留','約28%'],['金保留','約72%'],['アスナ参戦','約35%'],['SWITCH','約32%'],['ボスバトル','約48%'],['7テン','約65%'],['二刀流覚醒','約72%'],['エピソード','約82%'],['変動開始7ブル（ON）','約77.7%'],['赤7ブル','大当たり濃厚'],['ゼブラ7ブル','大当たり濃厚'],['全回転','大当たり濃厚']];
  el.relGrid.innerHTML=rows.map(([a,b])=>`<span>${a}</span><b>${b}</b>`).join('');
}

el.fire.addEventListener('pointerdown',beginFire,{passive:false});el.fire.addEventListener('pointerup',endFire,{passive:false});el.fire.addEventListener('pointercancel',endFire,{passive:false});
el.fire.addEventListener('touchstart',beginFire,{passive:false});el.fire.addEventListener('touchend',endFire,{passive:false});window.addEventListener('pointerup',endFire,{passive:false});window.addEventListener('touchend',endFire,{passive:false});window.addEventListener('blur',()=>state.firing=false);
el.custom.addEventListener('click',e=>{e.stopPropagation();el.customPanel.style.display=el.customPanel.style.display==='block'?'none':'block';});
customButtons.forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();setSevenMode(b.dataset.mode);}));
document.addEventListener('click',e=>{if(!el.customPanel.contains(e.target)&&e.target!==el.custom)el.customPanel.style.display='none';});



el.dataBtn.addEventListener('click',()=>{renderData();el.dataPanel.style.display='block'});
el.dataClose.addEventListener('click',()=>el.dataPanel.style.display='none');
el.catalogBtn.addEventListener('click',()=>{renderCatalog();el.catalogPanel.style.display='block'});
el.catalogClose.addEventListener('click',()=>el.catalogPanel.style.display='none');


el.musicCustomBtn.addEventListener('click',()=>{renderCustomMusic();el.musicCustomPanel.style.display='block'});
el.musicCustomClose.addEventListener('click',()=>el.musicCustomPanel.style.display='none');
el.audioTestBtn.addEventListener('click',()=>{startBgm();el.audioTestPanel.style.display='block'});
el.audioTestClose.addEventListener('click',()=>el.audioTestPanel.style.display='none');
document.querySelectorAll('#audioTestPanel [data-music]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.music;if(k==='stop')musicStop(0);else musicPlay(k,true,.1)}));
document.querySelectorAll('#audioTestPanel [data-audio]').forEach(b=>b.addEventListener('click',()=>{
 const n=b.dataset.audio;
 if(n==='stop'){stopBgm();stopRenderedSE();return;}
 psycho(n);
}));
el.settingsBtn.addEventListener('click',()=>{applySettingsUI();el.settingsPanel.style.display='block'});
el.settingsClose.addEventListener('click',()=>el.settingsPanel.style.display='none');
el.bgmVol.addEventListener('input',()=>{settings.bgmVol=Number(el.bgmVol.value)/100;saveSettings();updateBgm()});
el.seVol.addEventListener('input',()=>{settings.seVol=Number(el.seVol.value)/100;saveSettings()});
el.autoSpeed.addEventListener('change',()=>{settings.autoInterval=Number(el.autoSpeed.value);saveSettings()});
el.sensoryLevel.addEventListener('change',()=>{settings.sensoryLevel=el.sensoryLevel.value;saveSettings();psycho('prealert')});
el.effectDensity.addEventListener('change',()=>{settings.effectDensity=el.effectDensity.value;saveSettings()});
el.demoBtn.addEventListener('click',()=>setDemo(!demoMode));
el.resetDataBtn.addEventListener('click',()=>{
 localStorage.removeItem(SAVE_KEY);
 career={totalSpins:0,totalWins:0,totalBallsWon:0,bestChain:0,rushEntries:0,lightningEntries:0,sevenBuzz:0,sevenBuzzHits:0,maxFloor:1,secretFound:[],lawFound:[],unlocked:[],history:[],graph:[]};
 state.balls=CFG.startBalls;ui();renderHistory();renderAchievements();saveGame();
});
el.historyBtn.addEventListener('click',()=>{renderHistory();el.historyPanel.style.display='block'});
el.historyClose.addEventListener('click',()=>el.historyPanel.style.display='none');
el.achievementBtn.addEventListener('click',()=>{renderAchievements();el.achievementPanel.style.display='block'});
el.achievementClose.addEventListener('click',()=>el.achievementPanel.style.display='none');
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame()});
window.addEventListener('beforeunload',saveGame);
el.relBtn.addEventListener('click',e=>{e.stopPropagation();el.relPanel.style.display='block';buildReliabilityTable();});el.relClose.addEventListener('click',()=>el.relPanel.style.display='none');
el.auto.addEventListener('click',()=>{state.autoPlay=!state.autoPlay;el.auto.innerHTML=`AUTO<br>${state.autoPlay?'ON':'OFF'}`;if(state.autoPlay){state.autoTimer=setInterval(()=>{if(state.balls>0&&!state.roundPlaying){shoot();if(state.queue.length<CFG.holdMax&&Math.random()<.70)queueSpin();}},settings.autoInterval);}else if(state.autoTimer){clearInterval(state.autoTimer);state.autoTimer=null;}});
el.auto.addEventListener('dblclick',()=>{el.result.style.display=el.result.style.display==='grid'?'none':'grid';updateResult();});
el.rushStyle.addEventListener('click',()=>{state.rushStyle=state.rushStyle==='battle'?'impact':state.rushStyle==='impact'?'notice':'battle';setRushStyleUI();setRushTheme();el.sub.textContent=state.rushStyle==='battle'?'RUSH: バトル告知':state.rushStyle==='impact'?'RUSH: 一撃告知':'RUSH: 完全告知';});
el.sound.addEventListener('click',()=>{state.soundOn=!state.soundOn;el.sound.innerHTML=`音<br>${state.soundOn?'ON':'OFF'}`;updateBgm();if(state.soundOn)sfx('start',.5);});
window.addEventListener('resize',resize);
window.addEventListener('error',e=>{console.error('Runtime error:',e.error||e.message);setText('ERROR',e.message||'JavaScriptエラー');});
window.addEventListener('unhandledrejection',e=>console.error('Unhandled rejection:',e.reason));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW registration failed',err)));







window.__V20_8_DEBUG__={version:'20.8',evolution:()=>rushEvolutionState(),apply:applyRushEvolution,table:RUSH_EVOLUTION};
window.__V20_7_DEBUG__={version:'20.7',seven:sevenCinematic,clearSeven:clearSevenSync,timeline:[0,620,980,3190,3490,3890,4750]};
window.__V20_6_DEBUG__={version:'20.6',slots:[...CUSTOM_MUSIC_SLOTS],meta:()=>JSON.parse(JSON.stringify(customMusicMeta)),has:async(k)=>!!(await customMusicGet(k))};
window.__V20_5_DEBUG__={version:'20.5',direction:'dynamic-score',tracks:MUSIC_TRACKS};
window.__V20_4_DEBUG__={version:'20.4',tracks:MUSIC_TRACKS,play:(k)=>musicPlay(k),stop:()=>musicStop(0)};
window.__V20_3_DEBUG__={version:'20.3',direction:'longform-mechanical',rendered:RENDERED_SE};
window.__V20_2_DEBUG__={version:'20.2',rendered:RENDERED_SE,test:(n)=>{renderedSE(n);return RENDERED_SE[n]}};
window.__V20_1_DEBUG__={version:'20.1',legacyBlocked:['seven','win','rush','sword'],test:(n)=>{psycho(n);return n}};
window.__V20_DEBUG__={
 psycho:(name)=>{psycho(name);return name},
 sensory:()=>settings.sensoryLevel,
 audioState:()=>({ctx:!!bgmCtx,bgm:!!bgmOsc,pulse:!!bgmPulseTimer})
};
window.__V19_DEBUG__={
 rushSecretCount:()=>RUSH_SECRET_LAWS.length,
 rushSecrets:()=>RUSH_SECRET_LAWS.map(x=>({id:x.id,name:x.name})),
 forceRushState:(style='battle',lightning=false,st=100)=>{state.rush=true;state.lightning=!!lightning;state.st=st;state.rushStyle=style;setRushTheme();ui();return {rush:state.rush,lightning:state.lightning,st:state.st,rushStyle:state.rushStyle}},
 remainingCue:()=>{rushRemainingCue();return el.rushMilestone&&el.rushMilestone.textContent},
 theme:()=>[...document.body.classList].filter(x=>x.startsWith('rush-')||x==='lightningMode')
};
window.__V18_DEBUG__={
 makeFlow:(hit=true,color='on')=>{
  const p=window.__V12_HIDDEN_DEBUG__.samplePlan(hit,color);
  return p.normalFlow;
 },
 flowStages:()=>[...FLOW_STAGES],
 currentFlow:()=>({label:el.flowStep&&el.flowStep.textContent,width:el.flowBar&&el.flowBar.querySelector('i').style.width})
};
window.__V17_DEBUG__={
 renderData:()=>{renderData();return el.dataSummary.innerText},
 renderCatalog:()=>{renderCatalog();return el.catalogSummary.innerText},
 foundCounts:()=>({normal:career.lawFound.length,secret:career.secretFound.length}),
 physicsCfg:()=>({chR:CH.r,pinCount:pins.length}),
 rushMode:()=>state.rushStyle
};
window.__V16_DEBUG__={
 getSettings:()=>({...settings,demoMode}),
 setSettings:(p)=>{settings={...settings,...p};applySettingsUI();saveSettings();return {...settings}},
 setDemo:(v)=>{setDemo(v);return demoMode},
 demoStep:()=>{demoStep();return true},
 bossTheme:()=>[...document.body.classList].filter(x=>x.startsWith('boss-theme-')),
 clearSettings:()=>{localStorage.removeItem(SAVE_KEY+'_settings');return true}
};
window.__V14_DEBUG__={
 getCareer:()=>JSON.parse(JSON.stringify(career)),
 save:()=>{saveGame();return true},
 clearSave:()=>{localStorage.removeItem(SAVE_KEY);return true},
 setCareer:(p)=>{career={...career,...p};checkAchievements();return JSON.parse(JSON.stringify(career))},
 renderHistory:()=>{renderHistory();return el.historySummary.innerText},
 renderAchievements:()=>{renderAchievements();return el.achievementSummary.innerText},
 discover:(id)=>{const law=HIDDEN_LAWS.find(x=>x.id===id);if(!law)return false;discoverSecret(law);return true},
 achievementCount:()=>ACHIEVEMENTS.length
};
window.__V12_HIDDEN_DEBUG__={
  hiddenLawCount:()=>HIDDEN_LAWS.length,
  hiddenLawList:()=>HIDDEN_LAWS.map(x=>({id:x.id,name:x.name,desc:x.desc,tier:x.tier,hitOnly:!!x.hitOnly})),
  snapshot:()=>({hiddenLawHits,lastHiddenLaw:lastHiddenLaw&&lastHiddenLaw.id,rush:state.rush,lightning:state.lightning,st:state.st,floor:state.floor,sevenMode:state.sevenMode,rushStyle:state.rushStyle}),
  setState:(patch)=>{Object.assign(state,patch);ui();setRushStyleUI();return true;},
  samplePlan:(hit=true,color='on')=>buildSpinPlan({hit:!!hit,color,rateAtEntry:currentRate(),modeAtEntry:state.lightning?'lightning':state.rush?'rush':'normal'}),
  forceLaw:(id)=>{const law=HIDDEN_LAWS.find(x=>x.id===id);if(!law)return false;lastHiddenLaw=law;hiddenLawHits++;showHiddenLaw(law);return true;}
};
window.__PACHINKO_DEBUG__={
  lawCount:()=>LAW_LIBRARY.length,
  samplePlan:(hit=true,color='on')=>buildSpinPlan({hit:!!hit,color,rateAtEntry:currentRate(),modeAtEntry:state.lightning?'lightning':state.rush?'rush':'normal'}),
  snapshot:()=>({balls:state.balls,spins:state.spins,wins:state.wins,best:state.best,chain:state.chain,rush:state.rush,lightning:state.lightning,st:state.st,spinning:state.spinning,roundPlaying:state.roundPlaying,queue:state.queue.length,sevenMode:state.sevenMode,rushStyle:state.rushStyle}),
  forceHold:(hit=true,color='on')=>{if(state.queue.length<CFG.holdMax){state.queue.push({hit:!!hit,color:['on','red','gold'].includes(color)?color:'on',rateAtEntry:currentRate(),modeAtEntry:state.lightning?'lightning':state.rush?'rush':'normal'});paintHolds();if(!state.spinning&&!state.roundPlaying)nextSpin();}},
  forceRush:()=>{if(!state.rush)startRush();},
  forceLightning:()=>{state.rush=true;state.lightning=true;state.st=CFG.st;document.body.classList.add('rush');el.rushCounter.style.display='block';el.mode.textContent='LIGHTNING RUSH 1/12.8';ui();},
  setBalls:n=>{state.balls=Math.max(0,Math.floor(Number(n)||0));ui();}
};
setRushStyleUI();setSevenMode('on');buildReliabilityTable();resize();ui();requestAnimationFrame(loop);
})();
