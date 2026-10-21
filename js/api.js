'use strict';
const SQV=28;
// Real fixtures/results from TheSportsDB (free public key, CORS enabled).
const API={base:()=>'https://www.thesportsdb.com/api/v1/json/'+CONFIG.SPORTSDB_KEY+'/',
 leagueIds:{il:4644,epl:4328,liga:4335,seriea:4332,bund:4331,l1:4334,cl:4480},
 async j(p){const r=await fetch(API.base()+p);if(!r.ok)throw new Error(r.status);return r.json();},
 async fixtures(lg){const id=API.leagueIds[lg];const n=await API.j('eventsnextleague.php?id='+id);const ev=(n.events||[])[0];if(!ev)return[];const r=+ev.intRound,s=ev.strSeason;
  const out=[];(n.events||[]).forEach(e=>{if(e.strStatus==='NS'||!e.intHomeScore)out.push(e);});for(const rr of [r,r+1]){const d=await API.j(`eventsround.php?id=${id}&r=${rr}&s=${encodeURIComponent(s)}`);(d.events||[]).forEach(e=>{if(out.some(x=>x.idEvent===e.idEvent))return;if(e.strStatus==='NS'||!e.intHomeScore)out.push(e);});}
  out.sort((x,y)=>Date.parse(x.strTimestamp+'Z')-Date.parse(y.strTimestamp+'Z'));return out.filter(e=>Date.parse(e.strTimestamp+'Z')>Date.now()-6e6).slice(0,30);},
 // Live scores: ONE call covers every live match (free key, ~1 min delay). Cached 90s so the free rate limit (30/min) is never hit.
 _lv:null,_lvTs:0,
 async live(){if(API._lv&&Date.now()-API._lvTs<9e4)return API._lv;const d=await API.j('livescore.php?s=Soccer');const o={};(d.livescore||[]).forEach(e=>{o[e.idEvent]={sh:+e.intHomeScore||0,sa:+e.intAwayScore||0,min:String(e.strProgress||'').slice(0,8),st:String(e.strStatus||'').slice(0,12)};});API._lv=o;API._lvTs=Date.now();return o;},
 _static:null,
 async staticSq(){if(API._static)return API._static;try{const r=await fetch('data/squads.json?v='+SQV);API._static=r.ok?await r.json():{};}catch(e){API._static={};}return API._static;},
 // squad = static (public squad pages, names+positions) when complete enough, TheSportsDB free key otherwise; TSDB photos matched by name. Cached 7 days.
 async squad(tid){tid=String(tid||'').replace(/\D/g,'');if(!tid)return[];const k='bgSq28_'+tid;try{const c=JSON.parse(localStorage.getItem(k)||'null');if(c&&Date.now()-c.ts<7*864e5)return c.p;}catch(e){}
  let ts=[];try{const d=await API.j('lookup_all_players.php?id='+tid);ts=(d.player||[]).filter(x=>x.strPlayer&&!/coach|manager|staff/i.test(x.strPosition||'')).map(x=>({n:String(x.strPlayer).slice(0,40),pos:String(x.strPosition||'').slice(0,30),img:safeUrl(x.strCutout||x.strThumb||'')}));}catch(e){}
  const st=((await API.staticSq())[tid]||{}).p||[];let p=ts;
  if(st.length>=Math.max(12,ts.length)){const key=s=>norm(s).split(' ').pop();const ph={};ts.forEach(x=>{if(x.img)ph[key(x.n)]=x.img;});p=st.map(([n,pos,he])=>({n:String(n).slice(0,40),he:he?String(he).slice(0,40):'',pos:String(pos).slice(0,30),img:ph[key(n)]||''}));}
  localStorage.setItem(k,JSON.stringify({ts:Date.now(),p}));return p;},
 async result(id){const d=await API.j('lookupevent.php?id='+id);const e=(d.events||[])[0];if(!e)return null;
  const ft=/^(FT|AET|PEN|AP|Match Finished|Finished|After (Extra Time|Penalties))$/i.test(String(e.strStatus||'').trim());let tl=[];
  if(e.intHomeScore!=null){try{tl=(await API.j('lookuptimeline.php?id='+id)).timeline||[];}catch(x){}}
  const goals=tl.filter(t=>t.strTimeline==='Goal').sort((a,b)=>(+a.intTime||0)-(+b.intTime||0));
  const fg=goals[0];const noEv=ft&&(!tl.length||tl.length>=5);/* free key: timeline missing (Israeli league) or capped at 5 entries -> card counts unreliable, not scored */return{noEv,status:e.strStatus,firstSide:fg?(/yes/i.test(fg.strHome||'')?'h':'a'):null,has:e.intHomeScore!=null&&e.intHomeScore!=='',ft,sh:+e.intHomeScore||0,sa:+e.intAwayScore||0,firstScorer:goals[0]?goals[0].strPlayer:null,
   y:tl.filter(t=>/yellow/i.test(t.strTimelineDetail||'')).length,r:tl.filter(t=>/red/i.test(t.strTimelineDetail||'')).length,
   events:tl.map(t=>`${t.intTime||''}' ${t.strTimeline==='Goal'?'⚽':/red/i.test(t.strTimelineDetail)?'🟥':'🟨'} ${t.strPlayer||''}`)};}};
