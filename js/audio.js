'use strict';
let AC=null;function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}
function blast(c,t0,dur,vol){const o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.value=2650;l.frequency.value=38;lg.gain.value=180;l.connect(lg).connect(o.frequency);f.type='bandpass';f.frequency.value=2800;f.Q.value=3;o.connect(f).connect(g).connect(c.destination);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.03);g.gain.setValueAtTime(vol,t0+dur-.06);g.gain.linearRampToValueAtTime(0,t0+dur);o.start(t0);l.start(t0);o.stop(t0+dur+.02);l.stop(t0+dur+.02);}
function whistle(){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime;blast(c,n,.35,.18);blast(c,n+.45,.9,.2);}catch(e){}}
function finalWhistle(){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime;blast(c,n,.45,.18);blast(c,n+.6,.45,.18);blast(c,n+1.2,1.6,.22);}catch(e){}}
// Real recorded crowd sounds (CC0, Freesound), decoded into the shared WebAudio context so they play once audio is unlocked by a tap.
// chant(): fans singing/clapping in the stands (Ball of the Match) - freesound.org/s/588617 (Urkki69, CC0)
// roar(): stadium goal roar (correct guess / celebration) - freesound.org/s/829455 (itmightgetloud, CC0)
const SNDV='17',SND={ball:'sounds/ball-of-match',goal:'sounds/goal-roar'},SEL={};
// HTMLAudioElement (works on iOS Safari without WebAudio decode). m4a first, mp3 fallback. No synth fallback: on failure play nothing and log.
function sndEl(k){if(SEL[k])return SEL[k];const el=new Audio();el.preload='auto';const srcs=[SND[k]+'.m4a?v='+SNDV,SND[k]+'.mp3?v='+SNDV];let i=0;
 const canM4a=el.canPlayType('audio/mp4');if(!canM4a)i=1;el.src=srcs[i];el.addEventListener('error',()=>{if(i<srcs.length-1){el.src=srcs[++i];el.load();}else console.warn('[sound] failed to load',k,srcs);});return SEL[k]=el;}
function playSnd(k){try{const el=sndEl(k);el._real=1;el.muted=false;el.pause();el.currentTime=0;const p=el.play();console.log('[sound] play',k,el.src);if(p&&p.catch)p.catch(e=>console.warn('[sound] play failed',k,e&&e.message));}catch(e){console.warn('[sound] error',k,e);}}
function unlockSnd(){['ball','goal'].forEach(k=>{const el=sndEl(k);if(el._real)return;el.muted=true;const p=el.play();const r=()=>{if(el._real)return;el.pause();el.currentTime=0;el.muted=false;};if(p&&p.then)p.then(r,r);else r();});}
addEventListener('pointerdown',unlockSnd,{once:true,capture:true});
function roar(){playSnd('goal');}
function chant(){playSnd('ball');}
function cheer(sec){roar(sec);}
