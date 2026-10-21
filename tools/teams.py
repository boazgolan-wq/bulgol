import json,urllib.request,time
B='https://www.thesportsdb.com/api/v1/json/123/'
def j(p):
  for k in range(3):
    try:return json.load(urllib.request.urlopen(B+p,timeout=20))
    except Exception: time.sleep(2)
  return {}
ids={'il':4644,'epl':4328,'liga':4335,'seriea':4332,'bund':4331,'l1':4334}
out={}
for k,i in ids.items():
  ev=j(f'eventsnextleague.php?id={i}').get('events') or [];r=int(ev[0]['intRound']);s=ev[0]['strSeason'];T={}
  for rr in [r-2,r-1,r,r+1]:
    for e in j(f'eventsround.php?id={i}&r={rr}&s={s}').get('events') or []:
      T[e['strHomeTeam']]=e['idHomeTeam'];T[e['strAwayTeam']]=e['idAwayTeam']
    time.sleep(.5)
  out[k]=T;print(k,len(T),flush=True)
json.dump(out,open('teams.json','w'),ensure_ascii=False,indent=1)
