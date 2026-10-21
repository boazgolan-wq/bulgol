import json,urllib.request,urllib.parse,re,time,sys
UA={'User-Agent':'BulGol-squads/1.0 (boazgolan-wq@users.noreply.github.com)'}
def get(u):
  for k in range(3):
    try:return json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=25))
    except Exception as e: time.sleep(2)
  return {}
def search(q,lang='en'):
  d=get(f'https://{lang}.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=3&srsearch='+urllib.parse.quote(q))
  return [x['title'] for x in d.get('query',{}).get('search',[])]
def wikitext(t,lang='en'):
  d=get(f'https://{lang}.wikipedia.org/w/api.php?action=parse&prop=wikitext&format=json&redirects=1&page='+urllib.parse.quote(t))
  return d.get('parse',{}).get('wikitext',{}).get('*','')
def clean(n):
  n=re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]',r'\1',n);n=re.sub(r'\{\{[^}]*\}\}','',n);n=re.sub(r'<[^>]+>','',n);return n.strip()
def players(w):
  out=[]
  for m in re.finditer(r'\{\{\s*(?:Fs player|Football squad player|fs player|football squad player)\s*\|(.*?)\}\}(?=\s*(?:\n|\{\{|$))',w,re.S):
    body=m.group(1);f={}
    for part in re.split(r'\|(?![^\[]*\]\])',body):
      if '=' in part:a,b=part.split('=',1);f[a.strip().lower()]=b.strip()
    n=clean(f.get('name',''));p=f.get('pos','').strip().upper()
    if n and p in('GK','DF','MF','FW'):out.append([n,p])
  seen=set();r=[]
  for n,p in out:
    if n not in seen:seen.add(n);r.append([n,p])
  return r[:45]
T=json.load(open('teams.json'));res={}
for lg,ts in T.items():
  for name,tid in ts.items():
    best=[]
    for t in search(name+' football club'):
      w=wikitext(t);ps=players(w)
      if len(ps)>len(best):best=ps
      if len(ps)>=18:break
    res[tid]={'team':name,'lg':lg,'p':best};print(lg,name,len(best),flush=True)
json.dump(res,open('squads_en.json','w'),ensure_ascii=False)
