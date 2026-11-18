import { WORLDS, LESSONS } from './data.js';
import { S, save, resetAll, touchStreak } from './storage.js';
import { sfx, music, speak } from './audio.js';
import { initScene } from './scene.js?v=6';
import { runLesson } from './lessons.js';
const $ = id => document.getElementById(id);
const el = (t, c, x, f) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; if (f) e.onclick = f; return e; };
const RANKS = [[0, 'Novato'], [100, 'Explorador'], [300, 'Aventurero'], [700, 'Viajero'], [1500, 'Maestro'], [3000, 'Leyenda']];
const rank = () => RANKS.filter(r => S.xp >= r[0]).at(-1)[1];
const lvl = () => Math.floor(S.xp / 100) + 1;
const lessonsOf = id => LESSONS[id] || [];
const worldDone = id => lessonsOf(id).length > 0 && lessonsOf(id).every(l => S.done[l.id]);
const worldUnlocked = id => id === 1 || worldDone(id - 1);
const lessonUnlocked = (id, k) => worldUnlocked(id) && (k === 0 || S.done[lessonsOf(id)[k - 1].id]);
const currentWorld = () => WORLDS.find(w => worldUnlocked(w.id) && !worldDone(w.id))?.id || 8;
const CARD = ['#2f9e44,#8be36b', '#e0409a,#ffc2ea', '#d98a2a,#ffe08a', '#3b9a55,#ffb86b', '#3b6fd0,#9fd0ff', '#2bb3a0,#c6a8ff', '#4a3fd0,#9fe8ff', '#4a5a78,#9fb7cc'];
let view = currentWorld() - 1;

function fixLock() { return !worldUnlocked(view + 1); }
function goTo(i, dir) { i = Math.max(0, Math.min(7, i)); const d = dir || (i >= view ? 1 : -1); view = i; scene.show(view, d, fixLock()); sfx('click'); lobby(); }
let scene;
try { scene = initScene($('c'), d => goTo(view + d, d)); }
catch (e) { console.error(e); window.showErr && showErr('El 3D no pudo iniciar (' + e.message + '). Prueba otro navegador o baja la calidad.'); scene = { show() {}, setLocked() {}, setQuality() {} }; }

function lobby() {
  const w = WORLDS[view], id = w.id, ls = lessonsOf(id), un = worldUnlocked(id), dn = worldDone(id), n = ls.filter(l => S.done[l.id]).length, stars = ls.reduce((a, l) => a + (S.done[l.id] || 0), 0);
  $('tAv').textContent = (S.name || 'P')[0].toUpperCase(); $('tRank').textContent = `${rank()} · Nv ${lvl()}`; $('tXp').textContent = `${S.xp} XP`; $('tCoin').textContent = `🪙 ${S.coins}`;
  $('wnum').textContent = `MUNDO ${id}`; $('wtitle').textContent = w.name; $('wlvl').textContent = w.lvl;
  $('wdesc').textContent = un ? w.desc : `🔒 Completa el Mundo ${id - 1} (mínimo 70% en cada lección) para entrar.`;
  const pct = ls.length ? Math.round(n / ls.length * 100) : 0;
  $('wmeta').textContent = ls.length ? `${n}/${ls.length} lecciones · ${pct}%` : 'Lecciones en construcción';
  $('wstat').textContent = !un ? '🔒 Bloqueado' : dn ? '✓ Completado' : ls.length ? '● Disponible' : '🚧 Próximamente';
  $('wbar').style.width = pct + '%'; $('wxp').style.width = (ls.length ? Math.round(stars / (ls.length * 3) * 100) : 0) + '%';
  $('bPlay').textContent = !un ? '🔒 BLOQUEADO' : '▶ JUGAR'; $('bPlay').disabled = !un;
  $('aL').disabled = view === 0; $('aR').disabled = view === 7; $('nCont').disabled = !S.started;
  document.body.classList.toggle('big-text', S.settings.big); scene.setLocked(!un);
}
function modal(build) { const b = $('box'); b.replaceChildren(); build(b); $('modal').classList.remove('hidden'); }
function close() { $('modal').classList.add('hidden'); speechSynthesis?.cancel(); lobby(); }
const closeBtn = () => el('button', 'btn alt', 'Cerrar', () => { sfx('click'); close(); });
const rowWith = (...bs) => { const r = el('div', 'row'); r.append(...bs); return r; };

function startLesson(l, wid) {
  S.started = true; touchStreak(); save(); const root = $('lesson');
  document.body.classList.add('in-lesson'); $('fade').classList.add('go'); scene.zoom(true); sfx('unlock');
  setTimeout(() => {
    $('fade').classList.remove('go'); root.classList.remove('hidden');
    runLesson(l, wid - 1, root, first => {
      root.classList.add('hidden'); root.replaceChildren(); scene.zoom(false); document.body.classList.remove('in-lesson'); lobby();
      if (first && worldDone(wid)) { sfx('unlock'); if (wid < 8) goTo(wid, 1); modal(b2 => { b2.append(el('h2', '', '🎉 ¡Mundo completado!'), el('p', '', wid < 8 ? `Se desbloqueó el Mundo ${wid + 1}: ${WORLDS[wid].name}.` : '¡Terminaste todos los mundos!'), rowWith(closeBtn())); }); }
    });
  }, 1300);
}
// JUGAR: va directo a la siguiente lección pendiente del mundo que se ve en pantalla
function play() {
  const id = view + 1, ls = lessonsOf(id);
  if (!worldUnlocked(id)) return;
  if (!ls.length) return modal(b => b.append(el('h2', '', WORLDS[view].name), el('p', '', '🚧 Este mundo se construye en la Fase 4. Ya está conectado y se desbloqueará con tu progreso; sus lecciones se cargan en js/data.js.'), rowWith(closeBtn())));
  const k = ls.findIndex(l => !S.done[l.id]);
  if (k >= 0) return startLesson(ls[k], id);
  modal(b => { b.append(el('h2', '', '✓ Mundo completado'), el('p', '', 'Puedes repetir una lección para ganar más estrellas' + (id < 8 ? ' o pasar al siguiente mundo.' : '.')));
    b.append(rowWith(el('button', 'btn alt', 'Repetir lecciones', () => lessons(id)), ...(id < 8 ? [el('button', 'btn', 'Siguiente mundo ›', () => { close(); goTo(view + 1, 1); })] : []), closeBtn())); });
}
// Lista de lecciones (para volver atrás y repetir cualquier lección ya desbloqueada)
function lessons(id) {
  const w = WORLDS[id - 1];
  modal(b => {
    b.append(el('h2', '', `Mundo ${id}: ${w.name}`), el('small', '', `Nivel ${w.lvl}`));
    lessonsOf(id).forEach((l, k) => {
      const open = lessonUnlocked(id, k), s = S.done[l.id] || 0, r = el('div', 'lrow' + (open ? '' : ' lock'));
      const t = el('div', '', `${k + 1}. ${l.title}`); t.append(document.createElement('br'), el('small', '', l.goal)); r.append(t, el('span', '', open ? '⭐'.repeat(s) + '☆'.repeat(3 - s) : '🔒'));
      r.onclick = () => { if (open) { sfx('click'); close(); startLesson(l, id); } }; b.append(r);
    });
    b.append(rowWith(closeBtn()));
  });
}
function openWorlds() {
  modal(b => {
    b.append(el('h2', '', '🗺 Mundos')); const g = el('div', 'wgrid');
    WORLDS.forEach((w, i) => {
      const un = worldUnlocked(w.id), ls = lessonsOf(w.id), n = ls.filter(l => S.done[l.id]).length, c = el('button', 'wcard' + (un ? '' : ' lk') + (i === view ? ' sel' : ''));
      c.style.background = `linear-gradient(160deg,${CARD[i].split(',')[0]},${CARD[i].split(',')[1]})`;
      c.append(el('em', '', un ? (worldDone(w.id) ? '✓' : ['🏫', '🦁', '📚', '🏘', '✈', '💬', '🚀', '🏢'][i]) : '🔒'), el('b', '', `${w.id}. ${w.name}`), el('small', '', `${w.lvl} · ${ls.length ? `${n}/${ls.length} lecciones` : 'Próximamente'}`), el('small', '', un ? (worldDone(w.id) ? 'Completado' : 'Disponible') : `Completa el Mundo ${w.id - 1}`));
      c.onclick = () => { close(); goTo(i); }; g.append(c);
    });
    b.append(g, rowWith(closeBtn()));
  });
}
function openProfile() {
  modal(b => {
    const total = WORLDS.reduce((n, w) => n + lessonsOf(w.id).length, 0), done = Object.keys(S.done).length;
    const learned = Object.values(S.words).filter(v => v.ok >= 2 && v.ok > v.bad).length, weak = Object.values(S.words).filter(v => v.bad > v.ok).length;
    const head = el('div', 'line'); const av = el('span', 'av', (S.name || 'P')[0].toUpperCase()); av.style.cssText = 'width:64px;height:64px;font-size:32px'; head.append(av, el('h2', '', S.name)); b.append(head);
    const inp = el('input'); inp.type = 'text'; inp.value = S.name; inp.maxLength = 16; inp.onchange = () => { S.name = inp.value.trim() || 'Player'; save(); openProfile(); lobby(); }; b.append(inp);
    [['Rango', rank()], ['Nivel', lvl()], ['Experiencia', S.xp + ' XP'], ['Monedas', '🪙 ' + S.coins], ['Mundos completados', WORLDS.filter(w => worldDone(w.id)).length + '/8'], ['Lecciones realizadas', done + '/' + total], ['Palabras aprendidas', learned], ['Palabras por repasar', weak], ['Tiempo de aprendizaje', Math.round(S.time / 60) + ' min'], ['Racha diaria', S.streak + ' días']].forEach(([a, c]) => { const s = el('div', 'stat'); s.append(el('span', '', a), el('b', '', String(c))); b.append(s); });
    b.append(el('h3', '', 'Habilidades'));
    [['Lectura', 'read'], ['Escritura', 'write'], ['Escucha', 'listen'], ['Gramática', 'grammar'], ['Pronunciación (Fase 5)', 'speak'], ['Conversación (Fase 5)', 'talk']].forEach(([n, k]) => { const [a, t] = S.skills[k], p = t ? Math.round(a / t * 100) : 0, s = el('div', 'stat'); s.append(el('span', '', n), el('b', '', p + '%')); const bar = el('div', 'bar'), f = el('i'); f.style.width = p + '%'; bar.append(f); b.append(s, bar); });
    b.append(rowWith(closeBtn()));
  });
}
function openSettings() {
  modal(b => {
    b.append(el('h2', '', '⚙ Ajustes'));
    const mk = (txt, input) => { const l = el('label', 'set'); l.append(el('span', '', txt), input); b.append(l); };
    const rg = (min, max, step, v, f) => { const i = el('input'); i.type = 'range'; Object.assign(i, { min, max, step, value: v }); i.oninput = () => { f(+i.value); save(); }; return i; };
    const ck = (v, f) => { const i = el('input'); i.type = 'checkbox'; i.checked = v; i.onchange = () => { f(i.checked); save(); }; return i; };
    mk('Volumen', rg(0, 1, .1, S.settings.vol, v => S.settings.vol = v));
    mk('Música ambiental', ck(S.settings.music, v => { S.settings.music = v; music(v); }));
    mk('Efectos de sonido', ck(S.settings.fx, v => S.settings.fx = v));
    mk('Velocidad de pronunciación', rg(.5, 1.3, .1, S.settings.rate, v => { S.settings.rate = v; speak('Hello, nice to meet you'); }));
    mk('Subtítulos (traducción)', ck(S.settings.subs, v => S.settings.subs = v));
    mk('Texto grande', ck(S.settings.big, v => { S.settings.big = v; lobby(); }));
    const lg = el('select'); const o = el('option', '', 'Español'); o.value = 'es'; lg.append(o); mk('Idioma de traducción', lg);
    const q = el('select'); [['high', 'Alta'], ['low', 'Baja (más rápido)']].forEach(([v, t]) => { const op = el('option', '', t); op.value = v; q.append(op); }); q.value = S.settings.quality; q.onchange = () => { S.settings.quality = q.value; scene.setQuality(q.value); save(); }; mk('Calidad gráfica', q);
    b.append(rowWith(el('button', 'btn', 'Borrar progreso', () => { if (confirm('¿Borrar todo tu progreso?')) resetAll(); }), closeBtn()));
  });
}
$('bPlay').onclick = () => { sfx('click'); play(); };
$('nCont').onclick = () => { sfx('click'); const c = currentWorld() - 1; if (c !== view) goTo(c); play(); };
$('nWorlds').onclick = () => { sfx('click'); openWorlds(); };
$('nProf').onclick = $('tProf').onclick = () => { sfx('click'); openProfile(); };
$('nSet').onclick = () => { sfx('click'); openSettings(); };
$('aL').onclick = () => goTo(view - 1, -1); $('aR').onclick = () => goTo(view + 1, 1);
$('info').onclick = () => { if (worldUnlocked(view + 1) && lessonsOf(view + 1).length) { sfx('click'); lessons(view + 1); } };
scene.setQuality(S.settings.quality); scene.show(view, 1, fixLock()); lobby();
document.addEventListener('pointerdown', () => { if (S.settings.music) music(true); }, { once: true });
setInterval(() => { if (S.started && !document.hidden) { S.time += 10; save(); } }, 10000);
