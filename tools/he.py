import json,urllib.request,urllib.parse,re,time
exec(open('wiki.py').read().split('T=json.load')[0])
def players2(w):
  out=[];seen=set()
  for m in re.finditer(r'\{\{\s*(?:Fs player|Football squad player)\s*\|(.*?)\}\}(?=\s*(?:\n|\{\{|$))',w,re.S|re.I):
    f={}
    for part in re.split(r'\|(?![^\[]*\]\])',m.group(1)):
      if '=' in part:a,b=part.split('=',1);f[a.strip().lower()]=b.strip()
    raw=f.get('name','');lk=re.search(r'\[\[([^|\]]+)',raw);n=clean(raw);p=f.get('pos','').strip().upper()
    if n and p in('GK','DF','MF','FW') and n not in seen:seen.add(n);out.append([n,p,lk.group(1) if lk else n])
  return out[:45]
S=json.load(open('squads_en.json'));order=sorted(S,key=lambda k:S[k]['lg']!='il')
res={}
for tid in order:
  r=S[tid];best=[]
  for t in search(r['team']+' football club'):
    ps=players2(wikitext(t))
    if len(ps)>len(best):best=ps
    if len(ps)>=18:break
  titles=[x[2] for x in best];he={}
  for i in range(0,len(titles),50):
    d=get('https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=he&lllimit=500&redirects=1&format=json&titles='+urllib.parse.quote('|'.join(titles[i:i+50])))
    q=d.get('query',{});rd={x['to']:x['from'] for x in q.get('redirects',[])+q.get('normalized',[])}
    for pg in q.get('pages',{}).values():
      if pg.get('langlinks'):
        t0=pg['title'];he[t0]=re.sub(r'\s*\(.*?\)','',pg['langlinks'][0]['*']);
        for a,b in list(rd.items()):
          if a==t0:he[b]=he[t0]
    time.sleep(.3)
  def heof(t):
    t2=t[0].upper()+t[1:];return he.get(t2) or he.get(t2.replace('_',' ')) or ''
  res[tid]={'team':r['team'],'lg':r['lg'],'p':[[n,p,heof(lk)] for n,p,lk in best]}
  print(r['lg'],r['team'],len(best),sum(1 for x in res[tid]['p'] if x[2]),flush=True)
  if r['lg']=='il' and all(S[k]['lg']!='il' or k in res for k in S):json.dump(res,open('squads_il.json','w'),ensure_ascii=False)
json.dump(res,open('squads.json','w'),ensure_ascii=False)
