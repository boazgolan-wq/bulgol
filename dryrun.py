import asyncio,json,urllib.request,time
from playwright.async_api import async_playwright
B='https://www.thesportsdb.com/api/v1/json/123/'
def ev(i): return json.load(urllib.request.urlopen(B+'lookupevent.php?id='+i))['events'][0]
def live():
  d=json.load(urllib.request.urlopen(B+'livescore.php?s=Soccer'))['livescore'] or []
  return [e for e in d if e.get('strStatus') in ('1H','2H','HT')]
now=int(time.time()*1000)
def mk(e,lg,ko,mine,state='pre'):
  return {'id':'dry'+e['idEvent'],'lg':lg,'stake':'🍕','state':state,'minute':0,'sh':0,'sa':0,'y':0,'r':0,'c':0,'firstSc':None,'chat':[],'feed':[],
   'real':e['idEvent'],'home':'|'+e['strHomeTeam'],'away':'|'+e['strAwayTeam'],'hb':e.get('strHomeTeamBadge') or '','ab':e.get('strAwayTeamBadge') or '',
   'hid':e['idHomeTeam'],'aid':e['idAwayTeam'],'ko':ko,'lastPoll':now,
   'preds':{'בועז גולן':mine,'דני':{'h':1,'a':1,'sf':'h','st':'','y':3,'r':False},'יוסי':{'h':2,'a':0,'sf':'a','st':'','y':2,'r':True},'מאיה':{'h':0,'a':0,'sf':'n','st':'','y':4,'r':False}}}
async def main():
  tot=ev('2494064');il=ev('2493590');lv=live()
  ms=[mk(tot,'epl',now-3*3600e3,{'h':3,'a':1,'sf':'h','st':'James Maddison','y':3,'r':False}),
      mk(il,'il',now-3*3600e3,{'h':2,'a':1,'sf':'h','st':'','y':4,'r':False})]
  if lv:
    l=lv[0];e=ev(l['idEvent']);ms.append(mk(e,'cl',now-30*60e3,{'h':1,'a':1,'sf':'h','st':'','y':3,'r':False},'live'));print('LIVE',l['strLeague'],l['strHomeTeam'],l['strAwayTeam'],l['intHomeScore'],l['intAwayScore'],l['strProgress'])
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='he-IL');pg=await ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8799/');await pg.wait_for_timeout(800)
    await pg.evaluate("ms=>{S.matches=S.matches.filter(m=>!String(m.id).startsWith('dry'));S.matches.push(...ms);save();}",ms)
    await pg.reload();await pg.wait_for_timeout(1500)
    await pg.screenshot(path='screenshots/v20-dry-1-list.png',full_page=True)
    for m in ms:
      await pg.evaluate("id=>{cur=id;tab='match';render();}",m['id']);await pg.wait_for_timeout(2500)
      await pg.screenshot(path=f"screenshots/v20-dry-2-pre-{m['real']}.png",full_page=True)
    # live poll
    if len(ms)>2:
      await pg.evaluate("()=>{lastLive=0;pollLive();}");await pg.wait_for_timeout(3000)
      await pg.evaluate("id=>{cur=id;tab='match';render();}",ms[2]['id']);await pg.wait_for_timeout(800)
      print('LIVEHERO',(await pg.inner_text('.hero')).replace('\n',' | '))
      await pg.screenshot(path='screenshots/v20-dry-3-live.png',full_page=True)
    # FT for finished matches
    for m in ms[:2]:
      await pg.evaluate("id=>{cur=id;tab='match';const m=S.matches.find(x=>x.id===id);m.lastPoll=0;render();pollReal();}",m['id'])
      await pg.wait_for_selector('.hero .pill.done',timeout=20000);await pg.wait_for_timeout(1800)
      await pg.screenshot(path=f"screenshots/v20-dry-4-ft-{m['real']}.png",full_page=True)
      try:
        await pg.wait_for_selector('.ballpop',timeout=8000);await pg.wait_for_timeout(900);await pg.screenshot(path=f"screenshots/v20-dry-5-ball-{m['real']}.png");print('BALL',(await pg.inner_text('.ballpop')).replace('\n',' | '));await pg.click('[data-act=close]')
      except Exception as x: print('noball',x)
      r=await pg.evaluate("id=>{const m=S.matches.find(x=>x.id===id);return {sh:m.sh,sa:m.sa,y:m.y,r:m.r,fs:m.firstScName,noEv:m.noEv,feed:m.feed,winner:m.winner,pts:Object.fromEntries(Object.entries(m.preds).map(([k,p])=>[k,score(m,p)]))}}",m['id'])
      print(m['real'],json.dumps(r,ensure_ascii=False))
    print('errors',errs);await b.close()
asyncio.run(main())
