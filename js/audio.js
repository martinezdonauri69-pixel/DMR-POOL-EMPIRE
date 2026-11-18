import { S } from './storage.js';
let ctx, musicTimer;
const ac = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = S.settings.rate; u.volume = S.settings.vol;
  const v = speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
function tone(f, t = 0.15, type = 'sine', vol = 0.15, delay = 0) {
  try {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f; o.connect(g); g.connect(c.destination);
    const s = c.currentTime + delay; g.gain.setValueAtTime(vol * S.settings.vol, s); g.gain.exponentialRampToValueAtTime(0.0001, s + t);
    o.start(s); o.stop(s + t);
  } catch (e) {}
}
export function sfx(k) {
  if (!S.settings.fx) return;
  if (k === 'click') tone(520, .07, 'square', .08);
  if (k === 'good') { tone(660, .12, 'triangle'); tone(880, .18, 'triangle', .15, .1); }
  if (k === 'bad') tone(220, .25, 'sawtooth', .1);
  if (k === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'triangle', .16, i * .12));
  if (k === 'unlock') [392, 523, 659, 784, 988].forEach((f, i) => tone(f, .3, 'sine', .16, i * .1));
}
export function music(on) {
  clearInterval(musicTimer); if (!on) return;
  const n = [262, 330, 392, 523, 392, 330, 294, 392]; let i = 0;
  musicTimer = setInterval(() => tone(n[i++ % n.length], .9, 'sine', .05), 700);
}
