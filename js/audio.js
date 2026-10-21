'use strict';
let AC=null;function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}
function blast(c,t0,dur,vol){const o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.value=2650;l.frequency.value=38;lg.gain.value=180;l.connect(lg).connect(o.frequency);f.type='bandpass';f.frequency.value=2800;f.Q.value=3;o.connect(f).connect(g).connect(c.destination);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.03);g.gain.setValueAtTime(vol,t0+dur-.06);g.gain.linearRampToValueAtTime(0,t0+dur);o.start(t0);l.start(t0);o.stop(t0+dur+.02);l.stop(t0+dur+.02);}
function whistle(){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime;blast(c,n,.35,.18);blast(c,n+.45,.9,.2);}catch(e){}}
function finalWhistle(){try{const c=ac();if(c.state==='suspended')c.resume();const n=c.currentTime;blast(c,n,.45,.18);blast(c,n+.6,.45,.18);blast(c,n+1.2,1.6,.22);}catch(e){}}
// Real recorded crowd sounds (CC0, Freesound), decoded into the shared WebAudio context so they play once audio is unlocked by a tap.
// chant(): fans singing/clapping in the stands (Ball of the Match) - freesound.org/s/588617 (Urkki69, CC0)
// roar(): stadium goal roar (correct guess / celebration) - freesound.org/s/829455 (itmightgetloud, CC0)
const SND={ball:'sounds/ball-of-match.m4a?v=16',goal:'sounds/goal-roar.m4a?v=16'},SBUF={};
function loadSnd(k){if(!SBUF[k])SBUF[k]=fetch(SND[k]).then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>ac().decodeAudioData(b,ok,no))).catch(e=>{delete SBUF[k];throw e;});return SBUF[k];}
function playSnd(k){try{const c=ac();if(c.state==='suspended')c.resume();loadSnd(k).then(buf=>{const s=c.createBufferSource();s.buffer=buf;s.connect(c.destination);s.start();}).catch(()=>{});}catch(e){}}
function roar(){playSnd('goal');}
function chant(){playSnd('ball');}
function cheer(sec){roar(sec);}
