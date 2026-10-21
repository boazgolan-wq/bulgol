'use strict';
// BulGol service worker: notifications only (no caching).
// v9 2026-10-21: lock at kickoff; v8: predictions open anytime: joker removed, squads card
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{};}catch(_){d={body:e.data&&e.data.text()};}
 const mid=String(d.m||'').replace(/[^\w-]/g,'').slice(0,40);
 e.waitUntil(self.registration.showNotification(String(d.title||'BulGol').slice(0,80),{body:String(d.body||'').slice(0,240),icon:'icon.svg',tag:'ft-'+mid,data:{m:mid}}));});
self.addEventListener('notificationclick',e=>{e.notification.close();const mid=String((e.notification.data||{}).m||'').replace(/[^\w-]/g,'').slice(0,40);
 const url=new URL('./'+(mid?'?m='+encodeURIComponent(mid):''),self.registration.scope).href;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.registration.scope)&&'navigate' in c)return c.navigate(url).then(w=>w&&w.focus());}return self.clients.openWindow(url);}));});
