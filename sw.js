const CACHE="vr-sword-pachinko-v1-0-rc-finalqa";
const ASSETS=[
'BGM_NORMAL_V205.wav','BGM_SP_V205.wav','BGM_DUAL_V205.wav','BGM_JACKPOT_V205.wav','BGM_RUSH_V205.wav','BGM_LIGHTNING_V205.wav',
'BGM_NORMAL_V204.wav','BGM_SP_V204.wav','BGM_DUAL_V204.wav','BGM_JACKPOT_V204.wav','BGM_RUSH_V204.wav','BGM_LIGHTNING_V204.wav',
'PREALERT_V203.wav','SEVEN_V203.wav','PUSH_V203.wav','CONFIRM_V203.wav','JACKPOT_V203.wav','RUSH_V203.wav','SWORD_V203.wav',
'PREALERT.wav','SEVEN.wav','PUSH.wav','CONFIRM.wav','JACKPOT.wav','RUSH.wav','SWORD.wav',"./","./index.html","./style.css","./app.js","./laws.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./cabinet-concept.png","./shot.wav","./start.wav","./sword.wav","./seven.wav","./win.wav","./rush.wav"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
