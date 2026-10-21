'use strict';
// Minimal Supabase REST client (no SDK, CSP-friendly). Active only when CONFIG has URL+key.
const Cloud={on:()=>!!(CONFIG.SUPABASE_URL&&CONFIG.SUPABASE_ANON_KEY),
 tok:()=>localStorage.getItem('bg_tok')||'',
 h(){return{'apikey':CONFIG.SUPABASE_ANON_KEY,'Authorization':'Bearer '+(Cloud.tok()||CONFIG.SUPABASE_ANON_KEY),'Content-Type':'application/json','Prefer':'return=representation'};},
 captureToken(){const m=location.hash.match(/access_token=([^&]+)/);if(m){localStorage.setItem('bg_tok',decodeURIComponent(m[1]));history.replaceState(null,'',location.pathname+location.search);}},
 async magic(email){return fetch(CONFIG.SUPABASE_URL+'/auth/v1/otp',{method:'POST',headers:Cloud.h(),body:JSON.stringify({email,create_user:true,options:{emailRedirectTo:location.origin+location.pathname}})});},
 async user(){if(!Cloud.tok())return null;const r=await fetch(CONFIG.SUPABASE_URL+'/auth/v1/user',{headers:Cloud.h()});return r.ok?r.json():null;},
 async q(path,opt={}){const r=await fetch(CONFIG.SUPABASE_URL+'/rest/v1/'+path,{...opt,headers:Cloud.h()});if(!r.ok)throw new Error(await r.text());return r.status===204?null:r.json();},
 listMatches:()=>Cloud.q('matches?select=*&order=created_at.desc&limit=50'),
 getMatch:id=>Cloud.q('matches?id=eq.'+encodeURIComponent(id)+'&select=*'),
 createMatch:m=>Cloud.q('matches',{method:'POST',body:JSON.stringify(m)}),
 join:id=>Cloud.q('match_members',{method:'POST',body:JSON.stringify({match_id:id})}),
 upsertPred:(id,p)=>Cloud.q('predictions?on_conflict=match_id,user_id',{method:'POST',headers:{},body:JSON.stringify({match_id:id,pick:p})}),
 preds:id=>Cloud.q('predictions?match_id=eq.'+encodeURIComponent(id)+'&select=user_id,pick,points,profiles(name)'),
 chat:id=>Cloud.q('chat?match_id=eq.'+encodeURIComponent(id)+'&select=body,created_at,profiles(name)&order=created_at.asc&limit=100'),
 say:(id,body)=>Cloud.q('chat',{method:'POST',body:JSON.stringify({match_id:id,body:String(body).slice(0,200)})})};
