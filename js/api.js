'use strict';
// Real fixtures/results from TheSportsDB (free public key, CORS enabled).
const API={base:()=>'https://www.thesportsdb.com/api/v1/json/'+CONFIG.SPORTSDB_KEY+'/',
 leagueIds:{il:4644,epl:4328,liga:4335,seriea:4332,bund:4331,l1:4334},
 async j(p){const r=await fetch(API.base()+p);if(!r.ok)throw new Error(r.status);return r.json();},
 async fixtures(lg){const id=API.leagueIds[lg];const n=await API.j('eventsnextleague.php?id='+id);const ev=(n.events||[])[0];if(!ev)return[];const r=+ev.intRound,s=ev.strSeason;
  const out=[];(n.events||[]).forEach(e=>{if(e.strStatus==='NS'||!e.intHomeScore)out.push(e);});for(const rr of [r,r+1]){const d=await API.j(`eventsround.php?id=${id}&r=${rr}&s=${encodeURIComponent(s)}`);(d.events||[]).forEach(e=>{if(out.some(x=>x.idEvent===e.idEvent))return;if(e.strStatus==='NS'||!e.intHomeScore)out.push(e);});}
  out.sort((x,y)=>Date.parse(x.strTimestamp+'Z')-Date.parse(y.strTimestamp+'Z'));return out.filter(e=>Date.parse(e.strTimestamp+'Z')>Date.now()-6e6).slice(0,30);},
 async result(id){const d=await API.j('lookupevent.php?id='+id);const e=(d.events||[])[0];if(!e)return null;
  const ft=/^(FT|AET|PEN|AP|Match Finished|Finished|After (Extra Time|Penalties))$/i.test(String(e.strStatus||'').trim());let tl=[];
  if(e.intHomeScore!=null){try{tl=(await API.j('lookuptimeline.php?id='+id)).timeline||[];}catch(x){}}
  const goals=tl.filter(t=>t.strTimeline==='Goal').sort((a,b)=>(+a.intTime||0)-(+b.intTime||0));
  return{status:e.strStatus,has:e.intHomeScore!=null&&e.intHomeScore!=='',ft,sh:+e.intHomeScore||0,sa:+e.intAwayScore||0,firstScorer:goals[0]?goals[0].strPlayer:null,
   y:tl.filter(t=>/yellow/i.test(t.strTimelineDetail||'')).length,r:tl.filter(t=>/red/i.test(t.strTimelineDetail||'')).length,
   events:tl.map(t=>`${t.intTime||''}' ${t.strTimeline==='Goal'?'⚽':/red/i.test(t.strTimelineDetail)?'🟥':'🟨'} ${t.strPlayer||''}`)};}};
