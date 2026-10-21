'use strict';
// Notifications: local (service worker showNotification) now; true Web Push only when Supabase + VAPID public key are configured.
const Push={
 sup:()=>'Notification' in window&&'serviceWorker' in navigator,
 label(){if(!this.sup())return t('notifNo');return Notification.permission==='granted'?t('notifYes'):Notification.permission==='denied'?t('notifNo'):t('notifOn');},
 reg:null,
 init(){if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js',{scope:'./'}).then(r=>{this.reg=r;if(Notification.permission==='granted')this.subscribe();}).catch(()=>{});},
 // must be called from a user gesture
 async ask(){if(!this.sup())return toast(t('notifNo'));try{const p=await Notification.requestPermission();S.notifAsked=1;save();toast(p==='granted'?t('notifYes'):t('notifNo'));if(p==='granted')this.subscribe();}catch(e){}},
 maybeAsk(){if(this.sup()&&!S.notifAsked&&Notification.permission==='default')this.ask();},
 async local(title,body,mid){try{if(this.sup()&&Notification.permission==='granted'){const r=this.reg||await navigator.serviceWorker.ready;await r.showNotification(String(title).slice(0,80),{body:String(body).slice(0,240),icon:'icon.svg',tag:'ft-'+mid,data:{m:mid}});return;}}catch(e){}toast(String(body).slice(0,120));},
 b64(s){const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0));},
 async subscribe(){try{if(!Cloud.on()||!CONFIG.VAPID_PUBLIC_KEY||!Cloud.tok()||!('PushManager' in window))return;const r=this.reg||await navigator.serviceWorker.ready;const sub=await r.pushManager.getSubscription()||await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:this.b64(CONFIG.VAPID_PUBLIC_KEY)});const j=sub.toJSON();await Cloud.q('push_subscriptions?on_conflict=endpoint',{method:'POST',body:JSON.stringify({endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth})});}catch(e){}}};
