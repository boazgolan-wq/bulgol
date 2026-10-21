'use strict';
// Simulated tester friend ("בוחן 🤖"). Clearly marked as simulated; never a real person.
// Uses only the existing fixture cache (fixCache) — makes NO extra API requests.
const BOT='בוחן 🤖';
const Tester={
 on(){return S.botOn!==false;},
 say(m,k,vars){if(!this.on()||!m)return;let s=t(k);if(Array.isArray(s))s=s[rnd(s.length)];s=String(s);Object.entries(vars||{}).forEach(([a,b])=>s=s.split('{'+a+'}').join(b));m.chat.push({n:BOT,m:s.slice(0,200)});},
 sync(){S.leagues.forEach(l=>{const i=l.members.indexOf(BOT);if(this.on()&&i<0)l.members.push(BOT);if(!this.on()&&i>=0)l.members.splice(i,1);});},
 pred(m){const h=rnd(4),a=rnd(3);const p={h,a,y:2+rnd(4),c:7+rnd(6),r:Math.random()<.15,j:Math.random()<.2};
  if(Math.random()<.15){p.h=0;p.a=1+rnd(2);}// sometimes a bold away pick
  if(m.real)p.st='';else p.sc=rnd(PLAYERS.length);return p;},
 join(m){if(!this.on()||!m||m.preds[BOT]||m.state==='done')return;if((m.state!=='pre'||(m.real&&Date.now()>=lockAt(m)))&&!m.byBot)return;const p=this.pred(m);m.preds[BOT]=p;this.say(m,'botPre',{x:p.h>p.a?nm(m.home):p.h<p.a?nm(m.away):p.h+':'+p.a});},
 joinAll(){if(!this.on())return;let d=0;S.matches.forEach(m=>{if(m.state==='pre'&&!m.preds[BOT]){this.join(m);d=1;}});if(d)save();},
 open(){if(!this.on())return;const act=S.matches.filter(m=>m.state!=='done').length;if(act>=3)return;
  const have=new Set(S.matches.map(m=>String(m.real||'')));let lg,m;const base={id:'m'+Date.now()+rnd(999),stake:'',state:'pre',minute:0,sh:0,sa:0,y:0,r:0,c:0,firstSc:null,preds:{},chat:[],feed:[],byBot:1};
  const pool=[];Object.keys(fixCache).forEach(k=>(fixCache[k]||[]).forEach(e=>{const ko=Date.parse(e.strTimestamp+'Z');if(ko-LOCK5>Date.now()&&ko-WIN<Date.now()&&!have.has(String(e.idEvent)))pool.push([k,e,ko]);}));
  if(pool.length){pool.sort((a,b)=>a[2]-b[2]);const [k,e,ko]=pool[rnd(Math.min(4,pool.length))];lg=k;m={...base,lg,real:String(e.idEvent).replace(/\D/g,''),home:'|'+e.strHomeTeam,away:'|'+e.strAwayTeam,hb:safeUrl(e.strHomeTeamBadge),ab:safeUrl(e.strAwayTeamBadge),ko};}
  else{const ks=Object.keys(LEAGUES);lg=ks[rnd(ks.length)];const ts=LEAGUES[lg].teams;const h=rnd(ts.length);let a=rnd(ts.length);if(a===h)a=(h+1)%ts.length;m={...base,lg,home:ts[h],away:ts[a],ko:Date.now()+(2+rnd(3))*60000};}
  FRIENDS.slice(0,2+rnd(3)).forEach(f=>m.preds[f]=botPred(!!m.real));m.preds[BOT]=this.pred(m);this.say(m,'botOpenChat');
  S.matches.push(m);notify('🤖 '+t('botOpened')+' '+nm(m.home)+' – '+nm(m.away)+' — '+t('botJoinUs'));toast('🤖 '+t('botOpened')+' '+nm(m.home)+' – '+nm(m.away));save();if(tab==='home')render();},
 goal(m,side){if(!this.on()||!m.preds[BOT]||Math.random()<.3)return;const p=m.preds[BOT];const mine=Math.sign(p.h-p.a)===(side==='h'?1:-1);this.say(m,mine?'botGoalYes':'botGoalNo',{x:nm(side==='h'?m.home:m.away)});},
 card(m,red){if(!this.on()||!m.preds[BOT]||Math.random()<(red?.2:.75))return;this.say(m,red?'botRed':'botYellow');},
 ft(m){if(!this.on()||!m.preds[BOT])return;const b=m.preds[BOT].pts||0,me=m.preds[S.me];this.say(m,me&&me.pts>b?'botFtLose':b>0?'botFtWin':'botFtZero',{p:b});},
 picked(m){if(!this.on()||!m||!m.preds[BOT])return;const me=m.preds[S.me],b=m.preds[BOT];setTimeout(()=>{this.say(m,Math.sign(me.h-me.a)===Math.sign(b.h-b.a)?'botSame':'botDiff',{s:b.h+':'+b.a});save();if(tab==='match'&&cur===m.id){const c=$('#chat');if(c)updateLiveDom(m);}else toast('🤖 '+t('botReacted'));},1500);},
 duel(d){if(this.on()&&d.vs===BOT){d.acc=1;notify('🤖 '+t('botDuel'));}},
 tick(){try{this.joinAll();this.open();}catch(e){}},
 start(){this.sync();save();setTimeout(()=>this.tick(),20000);(function loop(){setTimeout(()=>{Tester.tick();loop();},60000+rnd(60000));})();}};
const dn=n=>n===BOT?t('botName'):n;
