import { WORLDS, LESSONS } from './data.js';
import { S, save, resetAll, touchStreak } from './storage.js';
import { sfx, music, speak } from './audio.js';
import { initScene } from './scene.js';
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
function currentWorld() { let c = 1; WORLDS.forEach(w => { if (worldUnlocked(w.id) && !worldDone(w.id)) c = Math.min(c === 1 && worldDone(1) ? w.id : c, w.id); }); return WORLDS.find(w => worldUnlocked(w.id) && !worldDone(w.id))?.id || 8; }

const scene = initScene($('c'), WORLDS, id => { sfx('click'); if (!$('hud').classList.contains('hidden')) openWorld(id); });
function refresh() {
  $('hXp').textContent = `⭐ ${S.xp} XP · Nv ${lvl()}`; $('hCoin').textContent = `🪙 ${S.coins}`; $('hStreak').textContent = `🔥 ${S.streak}`;
  scene.setState(WORLDS.map(w => worldUnlocked(w.id)), currentWorld() - 1, WORLDS.map(w => worldDone(w.id)));
  $('bCont').disabled = !S.started;
  document.body.classList.toggle('big-text', S.settings.big);
}
function modal(build) { const b = $('box'); b.replaceChildren(); build(b); $('modal').classList.remove('hidden'); }
function close() { $('modal').classList.add('hidden'); speechSynthesis?.cancel(); refresh(); }
const closeBtn = () => el('button', 'btn alt', 'Cerrar', () => { sfx('click'); close(); });

function openWorld(id) {
  const w = WORLDS[id - 1];
  modal(b => {
    b.append(el('h2', '', `Mundo ${w.id}: ${w.name}`), el('small', '', `Nivel ${w.lvl} · ${w.desc}`));
    if (!worldUnlocked(id)) { b.append(el('p', '', `🔒 Bloqueado. Completa todas las lecciones del Mundo ${id - 1} con al menos 70% para entrar.`)); b.append(el('div', 'row')); b.lastChild.append(closeBtn()); return; }
    const ls = lessonsOf(id);
    if (!ls.length) b.append(el('p', '', '🚧 Este mundo se construye en la Fase 4. La estructura y el desbloqueo ya funcionan; solo falta cargar sus lecciones en js/data.js.'));
    ls.forEach((l, k) => {
      const open = lessonUnlocked(id, k), s = S.done[l.id] || 0;
      const r = el('div', 'lrow' + (open ? '' : ' lock')); r.append(el('div', '', `${k + 1}. ${l.title}\n`)); r.firstChild.append(el('small', '', l.goal));
      r.append(el('span', '', open ? ('⭐'.repeat(s) + '☆'.repeat(3 - s)) : '🔒'));
      r.onclick = () => { if (!open) return; sfx('click'); S.started = true; touchStreak(); save(); startLesson(l, id); }; b.append(r);
    });
    const row = el('div', 'row'); row.append(closeBtn()); b.append(row);
  });
}
function startLesson(l, wid) {
  modal(b => runLesson(l, b, first => { const was = worldDone(wid); close(); if (first && worldDone(wid) && !was) { sfx('unlock'); modal(b2 => { b2.append(el('h2', '', '🎉 ¡Mundo completado!'), el('p', '', wid < 8 ? `Se desbloqueó el Mundo ${wid + 1}.` : '¡Terminaste todos los mundos!')); const r = el('div', 'row'); r.append(closeBtn()); b2.append(r); }); } else openWorld(wid); }));
}
function openProfile() {
  modal(b => {
    const total = WORLDS.reduce((n, w) => n + lessonsOf(w.id).length, 0), done = Object.keys(S.done).length;
    const learned = Object.values(S.words).filter(v => v.ok >= 2 && v.ok > v.bad).length, weak = Object.values(S.words).filter(v => v.bad > v.ok).length;
    b.append(el('h2', '', '🧑 ' + S.name));
    const inp = el('input'); inp.type = 'text'; inp.value = S.name; inp.maxLength = 16; inp.onchange = () => { S.name = inp.value.trim() || 'Player'; save(); openProfile(); }; b.append(inp);
    const rows = [['Rango', rank()], ['Nivel', lvl()], ['Experiencia', S.xp + ' XP'], ['Mundos completados', WORLDS.filter(w => worldDone(w.id)).length + '/8'], ['Lecciones terminadas', done], ['Palabras aprendidas', learned], ['Palabras por repasar', weak], ['Progreso del curso', Math.round(done / total * 100) + '% (contenido disponible)'], ['Tiempo de aprendizaje', Math.round(S.time / 60) + ' min'], ['Racha diaria', S.streak + ' días']];
    rows.forEach(([a, c]) => { const s = el('div', 'stat'); s.append(el('span', '', a), el('b', '', String(c))); b.append(s); });
    b.append(el('h3', '', 'Habilidades'));
    [['Lectura', 'read'], ['Escritura', 'write'], ['Escucha', 'listen'], ['Gramática', 'grammar'], ['Pronunciación (Fase 5)', 'speak'], ['Conversación (Fase 5)', 'talk']].forEach(([n, k]) => {
      const [a, t] = S.skills[k], p = t ? Math.round(a / t * 100) : 0; const s = el('div', 'stat'); s.append(el('span', '', n), el('b', '', p + '%')); const bar = el('div', 'bar'); const f = el('i'); f.style.width = p + '%'; bar.append(f); b.append(s, bar);
    });
    const r = el('div', 'row'); r.append(closeBtn()); b.append(r);
  });
}
function openSettings() {
  modal(b => {
    b.append(el('h2', '', '⚙ Configuración'));
    const mk = (txt, input) => { const l = el('label', 'set'); l.append(el('span', '', txt), input); b.append(l); return input; };
    const rg = (min, max, step, v, f) => { const i = el('input'); i.type = 'range'; Object.assign(i, { min, max, step, value: v }); i.oninput = () => { f(+i.value); save(); }; return i; };
    const ck = (v, f) => { const i = el('input'); i.type = 'checkbox'; i.checked = v; i.onchange = () => { f(i.checked); save(); }; return i; };
    mk('Volumen', rg(0, 1, .1, S.settings.vol, v => S.settings.vol = v));
    mk('Música ambiental', ck(S.settings.music, v => { S.settings.music = v; music(v); }));
    mk('Efectos de sonido', ck(S.settings.fx, v => S.settings.fx = v));
    mk('Velocidad del audio', rg(.5, 1.3, .1, S.settings.rate, v => { S.settings.rate = v; speak('Hello, nice to meet you'); }));
    mk('Mostrar traducciones', ck(S.settings.subs, v => S.settings.subs = v));
    mk('Texto grande (accesibilidad)', ck(S.settings.big, v => { S.settings.big = v; refresh(); }));
    const q = el('select'); ['high', 'low'].forEach(o => { const op = el('option', '', o === 'high' ? 'Alta' : 'Baja (más rápido)'); op.value = o; q.append(op); }); q.value = S.settings.quality; q.onchange = () => { S.settings.quality = q.value; scene.setQuality(q.value); save(); }; mk('Calidad gráfica', q);
    const r = el('div', 'row'); r.append(el('button', 'btn', 'Borrar progreso', () => { if (confirm('¿Borrar todo tu progreso?')) resetAll(); }), closeBtn()); b.append(r);
  });
}
function toMap() { $('title').classList.add('hidden'); $('hud').classList.remove('hidden'); $('hint').classList.remove('hidden'); refresh(); }
$('bStart').onclick = () => { sfx('click'); toMap(); };
$('bCont').onclick = () => { sfx('click'); toMap(); openWorld(currentWorld()); };
$('bProf').onclick = $('hProf').onclick = () => { sfx('click'); openProfile(); };
$('bSet').onclick = $('hSet').onclick = () => { sfx('click'); openSettings(); };
$('hHome').onclick = () => { sfx('click'); $('hud').classList.add('hidden'); $('hint').classList.add('hidden'); $('title').classList.remove('hidden'); refresh(); };
scene.setQuality(S.settings.quality); refresh();
document.addEventListener('pointerdown', () => { if (S.settings.music) music(true); }, { once: true });
setInterval(() => { if (S.started && !document.hidden) { S.time += 10; save(); } }, 10000);
