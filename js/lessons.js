import { S, save } from './storage.js';
import { speak, sfx } from './audio.js';
import { LESSONS } from './data.js';
const sh = a => [...a].sort(() => Math.random() - .5);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const h = (t, c, x, f) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; if (f) e.onclick = f; return e; };
const ALL = Object.values(LESSONS).flat().flatMap(l => l.words);

function opts(ans, idx, pool) {
  const d = sh(pool.filter(w => w[idx] !== ans)).slice(0, 3).map(w => w[idx]);
  return sh([ans, ...d]);
}
export function buildExercises(L) {
  const pool = L.words.length >= 4 ? L.words : ALL, ex = [];
  L.words.forEach(w => {
    sh(['listen', 'pick', 'type']).slice(0, 2).forEach(t => {
      if (t === 'listen') ex.push({ t, w: w[0], say: w[0], ans: w[1], opts: opts(w[1], 1, pool) });
      if (t === 'pick') ex.push({ t, w: w[0], q: w[1], ans: w[0], opts: opts(w[0], 0, pool) });
      if (t === 'type') ex.push({ t, w: w[0], q: w[1], ans: w[0] });
    });
  });
  L.sents.forEach(s => ex.push({ t: 'order', w: s[0], q: s[1], ans: s[0] }));
  // Repaso inteligente: palabras con más errores que aciertos vuelven a aparecer
  Object.entries(S.words).filter(([k, v]) => v.bad > v.ok && !L.words.some(w => w[0] === k)).slice(0, 3).forEach(([k]) => {
    const w = ALL.find(x => x[0] === k); if (w) ex.push({ t: 'pick', w: k, q: w[1], ans: k, opts: opts(k, 0, ALL), review: true });
  });
  return sh(ex).slice(0, 14);
}
export function runLesson(L, box, onExit) {
  let i = 0, ok = 0, ex = [];
  const skill = { listen: 'listen', pick: 'read', type: 'write', order: 'grammar' };
  function learn() {
    const w = L.words[i]; box.replaceChildren();
    const c = h('div', 'card'); c.append(h('small', '', `${L.title} · Presentación ${i + 1}/${L.words.length}`), h('h2', '', w[0]));
    if (S.settings.subs) c.append(h('p', 'tr', w[1]));
    const r = h('div', 'row'); r.append(h('button', 'btn alt', '🔊 Escuchar', () => speak(w[0])),
      h('button', 'btn', i < L.words.length - 1 ? 'Siguiente' : 'Practicar', () => { sfx('click'); if (++i < L.words.length) learn(); else { i = 0; ex = buildExercises(L); practice(); } }));
    c.append(r); box.append(c); speak(w[0]);
  }
  function record(e, good) {
    const w = S.words[e.w] || (S.words[e.w] = { ok: 0, bad: 0 }); good ? w.ok++ : w.bad++;
    const k = S.skills[skill[e.t]]; k[1]++; if (good) k[0]++;
    if (good) ok++; sfx(good ? 'good' : 'bad'); save();
  }
  function feedback(c, e, good, extra) {
    c.append(h('div', 'fb ' + (good ? 'good' : 'bad'), good ? '¡Correcto!' : 'Respuesta correcta: ' + e.ans));
    c.append(h('button', 'btn', 'Continuar', () => { i++; practice(); })); if (extra) extra();
  }
  function practice() {
    if (i >= ex.length) return finish();
    const e = ex[i]; box.replaceChildren(); const c = h('div', 'card');
    const bar = h('div', 'bar'); const fill = h('i'); fill.style.width = (i / ex.length * 100) + '%'; bar.append(fill);
    c.append(h('small', '', `Ejercicio ${i + 1}/${ex.length}${e.review ? ' · repaso' : ''}`), bar);
    if (e.t === 'listen' || e.t === 'pick') {
      c.append(h('h3', '', e.t === 'listen' ? 'Escucha y elige el significado' : 'Elige cómo se dice en inglés'));
      if (e.t === 'listen') { c.append(h('button', 'btn alt', '🔊 Escuchar', () => speak(e.say))); speak(e.say); } else c.append(h('h2', '', e.q));
      const g = h('div', 'opts');
      e.opts.forEach(o => g.append(h('button', 'opt', o, ev => {
        [...g.children].forEach(b => { b.disabled = true; if (b.textContent === e.ans) b.classList.add('good'); });
        const good = o === e.ans; if (!good) ev.target.classList.add('bad'); record(e, good); feedback(c, e, good); if (e.t === 'pick') speak(e.ans);
      })));
      c.append(g);
    } else if (e.t === 'type') {
      c.append(h('h3', '', 'Escribe en inglés'), h('h2', '', e.q));
      const inp = h('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.autocapitalize = 'off'; c.append(inp);
      const b = h('button', 'btn', 'Comprobar', () => { if (inp.disabled) return; inp.disabled = true; b.remove(); const good = norm(inp.value) === norm(e.ans); record(e, good); feedback(c, e, good); speak(e.ans); });
      c.append(h('p', '')); c.append(b); inp.addEventListener('keydown', k => { if (k.key === 'Enter') b.click(); }); setTimeout(() => inp.focus(), 50);
    } else {
      c.append(h('h3', '', 'Ordena la oración'), h('h2', '', e.q));
      const out = h('div', 'chips'), bank = h('div', 'chips'); c.append(out, bank);
      sh(e.ans.split(' ')).forEach(wd => { const ch = h('button', 'chip', wd); ch.onclick = () => { sfx('click'); (ch.parentNode === bank ? out : bank).append(ch); }; bank.append(ch); });
      const b = h('button', 'btn', 'Comprobar', () => { b.remove(); const got = [...out.children].map(x => x.textContent).join(' '); const good = norm(got) === norm(e.ans); [...out.children, ...bank.children].forEach(x => x.disabled = true); record(e, good); feedback(c, e, good); speak(e.ans); });
      c.append(b);
    }
    box.append(c);
  }
  function finish() {
    const pct = Math.round(ok / ex.length * 100), pass = pct >= 70, stars = pct === 100 ? 3 : pct >= 85 ? 2 : pass ? 1 : 0;
    const first = pass && !S.done[L.id], xp = ok * 10 + (first ? 30 : 0), coins = ok * 2 + (first ? 15 : 0);
    S.xp += xp; S.coins += coins;
    if (pass) S.done[L.id] = Math.max(S.done[L.id] || 0, stars);
    save(); sfx(pass ? 'win' : 'bad'); box.replaceChildren();
    const c = h('div', 'card'); c.append(h('h2', '', pass ? '¡Nivel superado!' : 'Casi lo logras'), h('p', '', '⭐'.repeat(stars) + '☆'.repeat(3 - stars)),
      h('p', '', `Evaluación: ${pct}% (${ok}/${ex.length}) · mínimo 70%`), h('p', '', `+${xp} XP · +${coins} monedas`));
    if (!pass) c.append(h('p', '', 'Repasa la lección y vuelve a intentarlo: no se puede avanzar sin dominar el contenido.'));
    const r = h('div', 'row'); r.append(h('button', 'btn alt', 'Repetir', () => { i = 0; ok = 0; learn(); }), h('button', 'btn', 'Volver al mapa', () => onExit(first)));
    c.append(r); box.append(c);
  }
  learn();
}
