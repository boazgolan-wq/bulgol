import asyncio,json,urllib.request,time,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8799/'
B='https://www.thesportsdb.com/api/v1/json/123/'
J=lambda p:json.load(urllib.request.urlopen(B+p))
def ev(i): return J('lookupevent.php?id='+i)['events'][0]
now=int(time.time()*1000)
def mk(e,lg,ko,mine,state='pre'):
  return {'id':'dry'+e['idEvent'],'lg':lg,'owner':'בועז גולן','stake':'🍕','state':state,'minute':0,'sh':0,'sa':0,'y':0,'r':0,'c':0,'firstSc':None,'chat':[],'feed':[],
   'real':e['idEvent'],'home':'|'+e['strHomeTeam'],'away':'|'+e['strAwayTeam'],'hb':e.get('strHomeTeamBadge') or '','ab':e.get('strAwayTeamBadge') or '',
   'hid':e['idHomeTeam'],'aid':e['idAwayTeam'],'ko':ko,'lastPoll':0,
   'preds':{'בועז גולן':mine,'דני':{'h':1,'a':1,'sf':'h','st':'','y':3,'r':False},'יוסי':{'h':2,'a':0,'sf':'a','st':'','y':2,'r':True}}}
async def main():
  out={}
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='he-IL');pg=await ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('response',lambda r:errs.append(f'{r.status} {r.url[40:100]} {time.time():.0f}') if 'thesportsdb.com/api' in r.url and ('timeline' in r.url or r.status!=200) else None)
    await pg.goto(URL);await pg.wait_for_timeout(1500)
    out['home_matches']=await pg.evaluate("S.matches.length")
    await pg.screenshot(path='screenshots/v35-1-home-empty.png')
    # create: real fixtures (default mode) for Israel + Europa League
    await pg.click('[data-tab=create]');await pg.wait_for_timeout(500)
    out['defaultMode']=await pg.evaluate("document.querySelector('#mreal').classList.contains('on')")
    for lg in ['il','el']:
      await pg.select_option('#lg',lg);await pg.wait_for_timeout(4000)
      out['fx_'+lg]=await pg.evaluate("[...document.querySelectorAll('input[name=fx]')].length")
      await pg.screenshot(path=f'screenshots/v35-2-fixtures-{lg}.png',full_page=True)
    # create Union SG – Hapoel Be'er Sheva (EL, today 19:45 IL) through the UI
    await pg.select_option('#lg','el');await pg.wait_for_timeout(4000)
    idx=await pg.evaluate("(fixCache.el||[]).findIndex(e=>/Be'er Sheva/.test(e.strAwayTeam+e.strHomeTeam))")
    out['bs_idx']=idx
    if idx>=0:
      await pg.locator('label:has(input[name=fx])',has_text='באר שבע').first.click();await pg.fill('#stake','פיצה למנצח')
      await pg.click('[data-act=create]');await pg.wait_for_timeout(3000)
      out['created']=await pg.evaluate("(()=>{const m=S.matches.find(x=>x.real==='2594939')||{};return {real:m.real,owner:m.owner,ko:new Date(m.ko).toISOString(),home:m.home,away:m.away}})()")
      await pg.screenshot(path='screenshots/v35-3-real-match-bs.png',full_page=True)
    await ctx.close();ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='he-IL');pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(1500)
    # dry runs on recently finished real matches
    ms=[mk(ev('2594567'),'cl',now-5*3600e3,{'h':2,'a':2,'sf':'a','st':'אזה','y':2,'r':False}),   # Bayern 2:2 Arsenal (CL 21.10) - Hebrew free-text scorer
        mk(ev('2493590'),'il',now-4*3600e3,{'h':2,'a':1,'sf':'h','st':'Igor Zlatanović','y':4,'r':False})] # Be'er Sheva 2:1 Jerusalem (IL 18.10)
    lv=[e for e in (J('livescore.php?s=Soccer')['livescore'] or []) if e.get('strStatus') in ('1H','2H','HT')]
    if lv:
      e=ev(lv[0]['idEvent']);ms.append(mk(e,'cl',now-40*60e3,{'h':1,'a':0,'sf':'h','st':'','y':3,'r':False},'live'));out['live_src']=[lv[0]['strHomeTeam'],lv[0]['intHomeScore'],lv[0]['intAwayScore'],lv[0]['strAwayTeam'],lv[0]['strProgress']]
    await pg.evaluate("ms=>{S.matches.push(...ms);save();}",ms);await pg.reload();await pg.wait_for_timeout(1500)
    await pg.wait_for_timeout(3000);await pg.evaluate("async()=>{lastLive=0;API._lvTs=0;S.matches.forEach(m=>m.lastPoll=0);await pollReal();}");await pg.wait_for_timeout(3000);await pg.evaluate("async()=>{S.matches.forEach(m=>m.lastPoll=0);await pollReal();}");out['all']=await pg.evaluate("S.matches.map(m=>[m.id,m.real,m.state,m.ko<Date.now()])");await pg.wait_for_timeout(6000)
    for m in ms:
      await pg.evaluate("id=>{cur=id;tab='match';render();}",m['id']);await pg.wait_for_timeout(2500);await pg.evaluate("()=>document.querySelector('#modal').classList.remove('show')")
      st=await pg.evaluate("id=>{const m=S.matches.find(x=>x.id===id);return {state:m.state,sh:m.sh,sa:m.sa,lv:m.lv,first:m.firstScName,noEv:m.noEv,wait:m.manualWait,winner:m.winner,feed:m.feed,pts:Object.fromEntries(Object.entries(m.preds).map(([k,v])=>[k,v.pts]))}}",m['id'])
      out['m'+m['real']]=st
      await pg.screenshot(path=f"screenshots/v35-4-{m['real']}-{st['state']}.png",full_page=True)
    # Israeli: creator enters first scorer (Hebrew) + cards, then scoring + Ball of the Match
    il=ms[1]['id']
    if out['m2493590']['wait']:
      await pg.evaluate("id=>{cur=id;tab='match';render();}",il);await pg.wait_for_timeout(800)
      await pg.evaluate("()=>document.querySelector('#modal').classList.remove('show')")
      await pg.fill('#fsc',"איגור זלאטנוביץ'");await pg.fill('#fy','4');await pg.fill('#fr','0')
      await pg.click('[data-act=ftsave]');await pg.wait_for_timeout(3500)
      out['il_after_manual']=await pg.evaluate("id=>{const m=S.matches.find(x=>x.id===id);return {state:m.state,sh:m.sh,sa:m.sa,first:m.firstScName,winner:m.winner,pts:Object.fromEntries(Object.entries(m.preds).map(([k,v])=>[k,v.pts]))}}",il)
      await pg.screenshot(path='screenshots/v35-5-il-manual-ft.png',full_page=True)
    out['errors']=errs
    await b.close()
  print(json.dumps(out,ensure_ascii=False,indent=1))
asyncio.run(main())
