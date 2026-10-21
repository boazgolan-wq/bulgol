'use strict';
let AC=null;function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}
function applause(sec=3){try{const c=ac(),n=c.currentTime;for(let i=0;i<90;i++){const t=n+Math.random()*sec,len=0.04,b=c.createBuffer(1,c.sampleRate*len,c.sampleRate),d=b.getChannelData(0);for(let j=0;j<d.length;j++)d[j]=(Math.random()*2-1)*Math.pow(1-j/d.length,3);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=900+Math.random()*1800;const g=c.createGain();g.gain.value=0.25+Math.random()*0.4*(1-(t-n)/sec);s.connect(f).connect(g).connect(c.destination);s.start(t);}}catch(e){}}
function blast(c,t0,dur,vol){const o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.value=2650;l.frequency.value=38;lg.gain.value=180;l.connect(lg).connect(o.frequency);f.type='bandpass';f.frequency.value=2800;f.Q.value=3;o.connect(f).connect(g).connect(c.destination);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.03);g.gain.setValueAtTime(vol,t0+dur-.06);g.gain.linearRampToValueAtTime(0,t0+dur);o.start(t0);l.start(t0);o.stop(t0+dur+.02);l.stop(t0+dur+.02);}
function whistle(){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime;blast(c,n,.35,.18);blast(c,n+.45,.9,.2);}catch(e){}}
function finalWhistle(){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime;blast(c,n,.45,.18);blast(c,n+.6,.45,.18);blast(c,n+1.2,1.6,.22);}catch(e){}}
// Two different crowd sounds (synthesized WebAudio, no samples):
// roar(): big stadium roar for the general FT celebration. chant(): rhythmic "o-le o-le" chant with drums + horn for Ball of the Match.
function noiseBuf(c,len){const b=c.createBuffer(2,c.sampleRate*len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let l=0;for(let i=0;i<d.length;i++){l=l*.97+(Math.random()*2-1)*.03;d[i]=(Math.random()*2-1)*.6+l*6;}}return b;}
function roar(sec=3.5){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime,len=sec+1;
 [[350,.9,.3],[900,.7,.22],[2200,1.2,.08]].forEach(([fq,q,v])=>{const s=c.createBufferSource();s.buffer=noiseBuf(c,len);const f=c.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(fq*.7,n);f.frequency.linearRampToValueAtTime(fq*1.3,n+.8);f.frequency.linearRampToValueAtTime(fq,n+sec);f.Q.value=q;
  const g=c.createGain();g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+.6);g.gain.setValueAtTime(v,n+sec*.5);g.gain.linearRampToValueAtTime(0,n+len);s.connect(f).connect(g).connect(c.destination);s.start(n);s.stop(n+len);});
 applause(sec);}catch(e){}}
function chant(){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime+.05,beat=.42;
 const drum=(t,hi)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(hi?180:110,t);o.frequency.exponentialRampToValueAtTime(45,t+.25);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.32);};
 const voice=(t,f,du,vow)=>{const fm=c.createBiquadFilter(),mg=c.createGain();fm.type='bandpass';fm.Q.value=4;fm.frequency.setValueAtTime(vow==='o'?500:vow==='e'?1800:700,t);mg.gain.setValueAtTime(0,t);mg.gain.linearRampToValueAtTime(.06,t+.05);mg.gain.setValueAtTime(.06,t+du*.7);mg.gain.linearRampToValueAtTime(0,t+du);fm.connect(mg).connect(c.destination);
  for(let v=0;v<10;v++){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f*(1+(Math.random()-.5)*.025)*(v%3?1:.5);o.connect(fm);o.start(t);o.stop(t+du+.02);}};
 // "O-le, o-le o-le o-leee" melody
 const mel=[[0,330,'o',1],[1,440,'e',1],[2,330,'o',.5],[2.5,440,'e',.5],[3,330,'o',.5],[3.5,440,'e',.5],[4,392,'o',1],[5,494,'e',2.2]];
 mel.forEach(([b,f,v,d])=>voice(n+b*beat,f,d*beat,v));for(let k=0;k<16;k++)drum(n+k*beat/2,k%2===0);
 const h=c.createOscillator(),hg=c.createGain();h.type='square';h.frequency.value=233;hg.gain.setValueAtTime(0,n+7*beat);hg.gain.linearRampToValueAtTime(.08,n+7.1*beat);hg.gain.linearRampToValueAtTime(0,n+9*beat);h.connect(hg).connect(c.destination);h.start(n+7*beat);h.stop(n+9.2*beat);}catch(e){}}
function cheer(sec){roar(sec);}
