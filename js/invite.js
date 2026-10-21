'use strict';
// In-app share sheet: saved friends (localStorage bgFriends), Contact Picker (Android Chrome), WhatsApp/SMS/share/copy.
const Invite={
 K:'bgFriends',MAX:50,
 list(){try{const a=JSON.parse(localStorage.getItem(this.K)||'[]');return Array.isArray(a)?a.filter(f=>f&&typeof f.n==='string').slice(0,this.MAX):[];}catch(e){return[];}},
 put(a){localStorage.setItem(this.K,JSON.stringify(a.slice(0,this.MAX)));},
 clean:s=>String(s||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,40),
 tel(s){let d=String(s||'').replace(/[^\d+]/g,'');if(d.startsWith('00'))d='+'+d.slice(2);if(/^0\d{8,9}$/.test(d))d='+972'+d.slice(1);d=d.replace(/(?!^)\+/g,'');return /^\+?\d{8,15}$/.test(d)?d:'';},
 canPick:()=>'contacts' in navigator&&'ContactsManager' in window,
 add(n,p,on){const a=this.list();n=this.clean(n);p=this.tel(p);if(!n&&!p)return false;if(a.length>=this.MAX){toast('⚠️ max '+this.MAX);return false;}if(a.some(f=>(p&&f.p===p)||(!p&&f.n===n))){const f=a.find(f=>(p&&f.p===p)||(!p&&f.n===n));if(on)f.c=1;this.put(a);return true;}a.push({id:'f'+Date.now()+rnd(1e4),n:n||p,p,c:on?1:0});this.put(a);return true;},
 open(id){this.mid=id;this.draw();$('#modal').classList.add('show');},
 draw(){const a=this.list();$('#mcard').innerHTML=`<div class="isheet"><h2>📤 ${t('shareMatch')}</h2>
 ${this.canPick()?`<button class="gold big" data-act="ipick">📇 ${t('pickContacts')}</button>`:`<small class="muted">ℹ️ ${t('noPicker')}</small>`}
 <div class="flist">${a.length?a.map(f=>`<label class="chk frow"><input type="checkbox" data-fc="${esc(f.id)}" ${f.c?'checked':''}><span>${esc(f.n)}${f.p?` <small dir="ltr">${esc(f.p)}</small>`:''}</span><button class="ghost sm fit" data-act="idel" data-fid="${esc(f.id)}" aria-label="${t('fDel')}">🗑</button></label>`).join(''):`<small>${t('noFriends')}</small>`}</div>
 <div class="row"><input id="fn" maxlength="40" placeholder="${t('fName')}"><input id="fp" type="tel" maxlength="20" inputmode="tel" placeholder="${t('fPhone')}" dir="ltr"></div><button class="ghost sm" data-act="iadd">➕ ${t('fAdd')}</button>
 <button class="big" data-act="isend">📨 ${t('sendSel')}</button>
 <div class="row"><button class="ghost sm" data-act="icopy">🔗 ${t('copyLink')}</button><button class="ghost sm" data-act="isys">📤 ${t('sysShare')}</button></div><button class="ghost sm" data-act="close">${t('close')}</button></div>`;},
 url(){return inviteUrl('m',this.mid);},
 text(){const m=S.matches.find(x=>x.id===this.mid);return (m?'⚽ '+nm(m.home)+' – '+nm(m.away)+' · ':'')+t('inviteTxt')+' '+this.url();},
 async pick(){try{const cs=await navigator.contacts.select(['name','tel'],{multiple:true});let k=0;(cs||[]).forEach(c=>{if(this.add((c.name||[])[0],(c.tel||[])[0],1))k++;});if(k)toast('✅ '+k);this.draw();}catch(e){}},
 async send(){const sel=this.list().filter(f=>f.c),txt=this.text(),ph=sel.map(f=>f.p).filter(Boolean);
  if(ph.length===1)return void window.open('https://wa.me/'+ph[0].replace('+','')+'?text='+encodeURIComponent(txt),'_blank','noopener');
  if(ph.length>1)return void(location.href='sms:'+ph.join(',')+'?&body='+encodeURIComponent(txt));
  return this.sys();},
 async sys(){try{if(navigator.share){await navigator.share({title:'BulGol',text:this.text()});return;}}catch(e){return;}this.copy();},
 async copy(){try{await navigator.clipboard.writeText(this.url());toast('🔗 '+t('copied'));}catch(e){toast(this.url());}}};
document.addEventListener('change',e=>{const id=e.target.dataset&&e.target.dataset.fc;if(!id)return;const a=Invite.list();const f=a.find(x=>x.id===id);if(f){f.c=e.target.checked?1:0;Invite.put(a);}});
document.addEventListener('click',e=>{const el=e.target.closest('[data-act^="i"]');if(!el)return;const a=el.dataset.act;
 if(a==='ipick')Invite.pick();else if(a==='iadd'){if(Invite.add($('#fn').value,$('#fp').value,1))Invite.draw();else toast('⚠️ '+t('fBad'));}
 else if(a==='idel'){e.preventDefault();Invite.put(Invite.list().filter(f=>f.id!==el.dataset.fid));Invite.draw();}
 else if(a==='isend')Invite.send();else if(a==='icopy')Invite.copy();else if(a==='isys')Invite.sys();});
