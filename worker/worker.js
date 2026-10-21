// Cloudflare Worker: caching, allow-listed proxy for API-Football. Key lives in the APIFOOTBALL_KEY secret.
const ORIGIN='https://boazgolan-wq.github.io';
const ALLOW={'/fixtures':{ttl:600,params:['id','league','season','date','next','live']},'/fixtures/events':{ttl:600,params:['fixture']}};
export default{async fetch(req,env,ctx){
 const cors={'Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin'};
 if(req.method==='OPTIONS')return new Response(null,{headers:{...cors,'Access-Control-Allow-Methods':'GET'}});
 if(req.method!=='GET')return new Response('method',{status:405,headers:cors});
 const u=new URL(req.url),rule=ALLOW[u.pathname];if(!rule)return new Response('not allowed',{status:404,headers:cors});
 const q=new URLSearchParams();for(const p of rule.params){const v=u.searchParams.get(p);if(v!=null){if(!/^[\w\-:]{1,20}$/.test(v))return new Response('bad param',{status:400,headers:cors});q.set(p,v);}}
 const target='https://v3.football.api-sports.io'+u.pathname+'?'+q;const ttl=q.has('live')?60:rule.ttl;
 const cache=caches.default,key=new Request(target);let r=await cache.match(key);
 if(!r){const up=await fetch(target,{headers:{'x-apisports-key':env.APIFOOTBALL_KEY}});r=new Response(up.body,up);r.headers.set('Cache-Control','public, max-age='+ttl);if(up.ok)ctx.waitUntil(cache.put(key,r.clone()));}
 r=new Response(r.body,r);Object.entries(cors).forEach(([k,v])=>r.headers.set(k,v));return r;}};
