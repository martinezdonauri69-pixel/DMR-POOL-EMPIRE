import { S, save } from './storage.js';
import { speak, sfx } from './audio.js';
import { LESSONS, WORLDS } from './data.js';
const sh = a => [...a].sort(() => Math.random() - .5), pick = a => a[Math.floor(Math.random() * a.length)], wait = ms => new Promise(r => setTimeout(r, ms));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const h = (t, c, x, f) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; if (f) e.onclick = f; return e; };
const ALL = Object.values(LESSONS).flat().flatMap(l => l.words);
const EM = { Red: '🔴', Blue: '🔵', Green: '🟢', Yellow: '🟡', Black: '⚫', White: '⚪', Orange: '🟠', Purple: '🟣', Pink: '🌸', Brown: '🟤', Dog: '🐶', Cat: '🐱', Bird: '🐦', Fish: '🐟', Horse: '🐴', Lion: '🦁', Elephant: '🐘', Monkey: '🐵', Whale: '🐳', Shark: '🦈', Apple: '🍎', Banana: '🍌', Grape: '🍇', Strawberry: '🍓', Watermelon: '🍉', Lemon: '🍋', Pineapple: '🍍', Mango: '🥭', One: '1️⃣', Two: '2️⃣', Three: '3️⃣', Four: '4️⃣', Five: '5️⃣', Six: '6️⃣', Seven: '7️⃣', Eight: '8️⃣', Nine: '9️⃣', Ten: '🔟' };
const emo = w => EM[w[0]];
const GUIDE = [['Leo', '🦁'], ['Mia', '🦜'], ['Bo', '🐻'], ['Zoe', '🦊'], ['Max', '🐼'], ['Luna', '🐱'], ['Nova', '🤖'], ['Dr. Owl', '🦉']];
const THEME = [['#2f9e44', '#0b3a22'], ['#e0409a', '#4a1245'], ['#d98a2a', '#4a2a08'], ['#3b9a55', '#10381f'], ['#3b6fd0', '#0f1f55'], ['#2bb3a0', '#0a3a45'], ['#6a5af0', '#1a1255'], ['#4a5a78', '#10162a']];
const PRAISE = ['¡Excelente!', '¡Perfecto, sigue así!', '¡Muy bien!', '¡Lo lograste!', '¡Eres un crack!'];
const TYPES = { convo: { lv: 1, sk: 'read' }, image: { lv: 1, sk: 'read' }, explore: { lv: 1, sk: 'read' }, listen: { lv: 2, sk: 'listen' }, memory: { lv: 2, sk: 'read' }, build: { lv: 2, sk: 'grammar' }, sit: { lv: 2, sk: 'talk' }, pron: { lv: 3, sk: 'speak' }, timed: { lv: 3, sk: 'read' }, surprise: { lv: 3, sk: 'listen' } };
const TITLE = { convo: ['💬', 'Conversación', 'Habla con tu guía'], image: ['🖼', 'Desafío de imágenes', '¿Qué es cada cosa?'], explore: ['🧭', 'Misión de exploración', 'Encuentra los objetos'], listen: ['🎧', 'Comprensión auditiva', 'Escucha con atención'], memory: ['🧠', 'Juego de memoria', 'Une las parejas'], build: ['🧩', 'Construye la oración', 'Ordena las palabras'], sit: ['🎭', 'Situación real', 'Resuelve la escena'], pron: ['🎤', 'Pronunciación', 'Di la frase en voz alta'], timed: ['⏱', 'Reto contrarreloj', '¡6 segundos por pregunta!'], surprise: ['🎁', '¡Desafío sorpresa!', '¿Qué será?'], boss: ['⚔', 'Evaluación final', 'Vence al jefe'] };
// Situaciones reales por lección: [frase del personaje, opciones, índice correcto, explicación]
const SIT = {
  w1l1: { place: '🏫 En la puerta de la escuela', steps: [['Good morning!', ['Good morning!', 'Goodbye', 'Sorry'], 0, '“Good morning” es el saludo de la mañana y se responde igual.'], ['Thank you for coming!', ['Please', 'Thank you', 'Good night'], 1, 'Cuando alguien te agradece, respondes con cortesía: “Thank you”.']] },
  w1l2: { place: '🧒 Conoces a un amigo nuevo', steps: [['Hi! What is your name?', ['I am fine', 'My name is Alex', 'See you later'], 1, 'Te preguntan tu nombre: se responde “My name is…”.'], ['How are you?', ['I am fine', 'Goodbye', 'Nice to meet you'], 0, '“How are you?” se responde con “I am fine”.']] }
};
const avail = L => { const em = L.words.filter(emo).length >= 4; const ok = { convo: 1, listen: 1, memory: L.words.length >= 4, pron: 1, timed: L.words.length >= 4, surprise: 1, image: em, explore: em, build: L.sents.length > 0, sit: !!SIT[L.id] }; return Object.keys(ok).filter(k => ok[k]); };
const acc = k => { const [a, t] = S.skills[k]; return t ? a / t : .5; };
// Selección inteligente: contenido disponible + habilidad más débil + variedad (penaliza lo reciente) + dificultad creciente con variación
function plan(L) {
  const sc = k => { const i = S.hist.indexOf(k); return Math.random() + (1 - acc(TYPES[k].sk)) * .8 - (i >= 0 ? .9 - i * .1 : 0); };
  const p = avail(L).sort((a, b) => sc(b) - sc(a)).slice(0, 4);
  p.sort((a, b) => TYPES[a].lv + Math.random() * 1.6 - TYPES[b].lv - Math.random() * 1.6);
  if (p.length > 1 && p[0] === S.hist[0]) [p[0], p[1]] = [p[1], p[0]];
  return p;
}
function choose(parent, opts, ans, explain, say, maxWrong = 2) {
  return new Promise(res => {
    let w = 0; const g = h('div', 'opts'), done = ok => setTimeout(() => res(ok), ok ? 800 : 1700);
    opts.forEach(o => { const b = h('button', 'opt', o, () => {
      if (b.disabled) return;
      if (o === ans) { b.classList.add('good'); [...g.children].forEach(x => x.disabled = true); sfx('good'); say(pick(PRAISE)); done(w === 0); }
      else { w++; b.classList.add('bad'); b.disabled = true; sfx('bad');
        if (w >= maxWrong) { [...g.children].forEach(x => { x.disabled = true; if (x.textContent === ans) x.classList.add('good'); }); say(explain); done(false); }
        else say('Casi. Pista: empieza con “' + ans.slice(0, 2) + '…”. ¡Inténtalo otra vez!'); } }); g.append(b); });
    parent.append(g);
  });
}
function typeQ(parent, w, say) {
  return new Promise(res => {
    const i = h('input'); i.type = 'text'; i.placeholder = 'Escribe en inglés'; i.autocomplete = 'off'; i.autocapitalize = 'off';
    const b = h('button', 'btn', 'Atacar ⚔', () => { if (i.disabled) return; const g = norm(i.value) === norm(w[0]); i.disabled = b.disabled = true;
      if (g) { sfx('good'); say(pick(PRAISE)); setTimeout(() => res(true), 700); } else { sfx('bad'); say(`Era “${w[0]}” (${w[1]}).`); setTimeout(() => res(false), 1600); } });
    parent.append(i, b); i.addEventListener('keydown', k => { if (k.key === 'Enter') b.click(); }); setTimeout(() => i.focus(), 60);
  });
}
export function runLesson(L, wi, root, onExit) {
  S.hist = S.hist || []; S.ach = S.ach || {};
  const [gname, gem] = GUIDE[wi], W = WORLDS[wi], pool = L.words.length >= 4 ? L.words : ALL;
  let alive = true, run, body, prog;
  root.replaceChildren(); root.style.setProperty('--a', THEME[wi][0]); root.style.setProperty('--b', THEME[wi][1]);
  const dist = (w, i) => sh([w[i], ...sh(pool.filter(x => x[i] !== w[i])).slice(0, 3).map(x => x[i])]);
  const pw = (n, from = L.words) => { const wk = from.filter(w => S.words[w[0]] && S.words[w[0]].bad > S.words[w[0]].ok); return [...sh(wk), ...sh(from.filter(w => !wk.includes(w)))].slice(0, n); };
  const explain = w => `“${w[0]}” significa “${w[1]}”.`;
  function rec(w, good, sk) {
    mood(good);
    if (w) { const x = S.words[w] || (S.words[w] = { ok: 0, bad: 0 }); good ? x.ok++ : x.bad++; }
    if (sk) { const k = S.skills[sk]; k[1]++; if (good) k[0]++; }
    run.n++; if (good) run.ok++; else if (w) run.wrong.add(w); save();
  }
  let GB = null, streak = 0;
  const SAD = ['Ay, casi… ¡no pasa nada!', 'Uy, ese era difícil. ¡Tú puedes!', 'Oh no… ¡pero así se aprende!', 'Mmm, no era… ¡yo creo en ti!'];
  const JOY = ['¡Cinco seguidas! ¡Estoy tan feliz que voy a bailar! 💃', '¡Wow, qué racha! Me haces muy feliz 🎉', '¡Increíble! ¡Estoy orgulloso de ti! 🌟', '¡Eres un campeón! ¡Casi lloro de la emoción! 🥹'];
  function mood(good) {
    if (!GB) return; const { av, bub } = GB;
    if (good) { streak++; if (streak % 5 === 0) { bub.textContent = pick(JOY); av.classList.remove('sad'); av.classList.add('happy'); clearTimeout(av._m); av._m = setTimeout(() => av.classList.remove('happy'), 3200); } }
    else { streak = 0; bub.textContent = pick(SAD) + ' ' + bub.textContent; av.classList.remove('happy'); av.classList.add('sad'); clearTimeout(av._m); av._m = setTimeout(() => av.classList.remove('sad'), 2800); }
  }
  function guideBox(st) { const g = h('div', 'guide'), av = h('div', 'gav', gem), bub = h('div', 'bub'); g.append(av, bub); st.append(g); GB = { av, bub }; av.onanimationend = () => av.classList.remove('jump');
    return t => { bub.textContent = t; av.classList.remove('jump'); void av.offsetWidth; av.classList.add('jump'); }; }
  const area = st => { const a = h('div', 'area'); st.append(a); return a; };
  function topbar(n) {
    const t = h('div', 'ltop'); t.append(h('button', 'x', '✕', () => { if (confirm('¿Salir de la aventura? Perderás el avance de esta lección.')) { alive = false; root.replaceChildren(); onExit(false); } }));
    prog = h('div', 'prog'); for (let i = 0; i < n; i++) prog.append(h('i')); t.append(prog); return t;
  }
  const A = {
    async convo(st) { st.append(h('div', 'place', '💬 Charla con ' + gname)); const say = guideBox(st), a = area(st);
      for (const w of pw(3)) { a.replaceChildren(); say(`¡Hey! Estoy aprendiendo… ¿cómo se dice “${w[1]}” en inglés?`); const g = await choose(a, dist(w, 0), w[0], explain(w), say); rec(w[0], g, 'read'); speak(w[0]); } },
    async image(st) { st.append(h('div', 'place', '🖼 ¿Qué ves?')); const say = guideBox(st), a = area(st), all = ALL.filter(emo);
      for (const w of pw(4, L.words.filter(emo))) { a.replaceChildren(h('div', 'model3d', EM[w[0]]), h('div', 'ped')); say('¡Mira bien! ¿Qué es esto en inglés?'); const g = await choose(a, sh([w[0], ...sh(all.filter(x => x[0] !== w[0])).slice(0, 3).map(x => x[0])]), w[0], explain(w), say); rec(w[0], g, 'read'); speak(w[0]); } },
    async explore(st) { st.append(h('div', 'place', '🧭 Misión en ' + W.name)); const say = guideBox(st), field = h('div', 'field'); st.append(field); const all = ALL.filter(emo);
      for (const w of pw(4, L.words.filter(emo))) { field.replaceChildren(); say(`Misión: encuentra “${w[0]}” en el escenario.`); speak(w[0]);
        const items = sh([w, ...sh(all.filter(x => x[0] !== w[0])).slice(0, 5)]);
        const g = await new Promise(res => { let t = 0; items.forEach((it, k) => { const b = h('button', 'item', EM[it[0]]); b.style.left = (6 + (k % 3) * 31 + Math.random() * 6) + '%'; b.style.top = (6 + Math.floor(k / 3) * 44 + Math.random() * 8) + '%'; b.style.animationDelay = (k * .3) + 's';
          b.onclick = () => { if (it[0] === w[0]) { sfx('good'); b.classList.add('found'); say(pick(PRAISE)); setTimeout(() => res(t === 0), 800); } else { t++; sfx('bad'); b.classList.add('shake'); say(t > 1 ? `Pista: en español es “${w[1]}”.` : 'Ese no es. ¡Sigue buscando!'); setTimeout(() => b.classList.remove('shake'), 400); } }; field.append(b); }); });
        rec(w[0], g, 'read'); } },
    async listen(st) { st.append(h('div', 'place', '🎧 Escucha la conversación')); const say = guideBox(st), a = area(st);
      for (const w of pw(4)) { a.replaceChildren(h('div', 'waves'), h('button', 'spk', '🔊', () => speak(w[0]))); say('Escucha y dime qué significa.'); speak(w[0]); const g = await choose(a, dist(w, 1), w[1], explain(w), say); rec(w[0], g, 'listen'); } },
    async memory(st) { st.append(h('div', 'place', '🧠 Une inglés y español')); const say = guideBox(st); say('Toca dos cartas. ¡Encuentra las 4 parejas!');
      const ws = pw(4), cs = sh(ws.flatMap(w => [{ k: w[0], t: w[0] }, { k: w[0], t: w[1] }])), g = h('div', 'mem'); st.append(g);
      await new Promise(res => { let open = [], lock = false, moves = 0, found = 0;
        cs.forEach(c => { const b = h('button', 'card2', '?'); b.onclick = () => { if (lock || b.classList.contains('up') || b.classList.contains('ok')) return; sfx('click'); b.classList.add('up'); b.textContent = c.t; if (c.t === c.k) speak(c.t); open.push([b, c]);
          if (open.length === 2) { moves++; lock = true; const [[b1, c1], [b2, c2]] = open;
            if (c1.k === c2.k) setTimeout(() => { [b1, b2].forEach(x => { x.classList.remove('up'); x.classList.add('ok'); }); open = []; lock = false; sfx('good'); if (++found === 4) { const good = moves <= 6 ? 4 : moves <= 9 ? 3 : 2; ws.forEach((w, i) => rec(w[0], i < good, 'read')); say(pick(PRAISE)); setTimeout(res, 900); } }, 500);
            else setTimeout(() => { [b1, b2].forEach(x => { x.classList.remove('up'); x.textContent = '?'; }); open = []; lock = false; sfx('bad'); }, 900); } }; g.append(b); }); }); },
    async build(st) { st.append(h('div', 'place', '🧩 Taller de oraciones')); const say = guideBox(st), a = area(st);
      for (const s of sh(L.sents).slice(0, 2)) { a.replaceChildren(); say(`Ayúdame a decir: “${s[1]}”`); const out = h('div', 'chips wood'), bank = h('div', 'chips wood'); a.append(out, bank);
        sh(s[0].split(' ')).forEach(wd => { const c = h('button', 'chip', wd); c.onclick = () => { sfx('click'); (c.parentNode === bank ? out : bank).append(c); }; bank.append(c); });
        const g = await new Promise(res => { let t = 0; const b = h('button', 'btn', 'Construir', () => { const got = [...out.children].map(x => x.textContent).join(' ');
          if (norm(got) === norm(s[0])) { b.remove(); sfx('good'); say(pick(PRAISE)); speak(s[0]); setTimeout(() => res(t === 0), 1000); } else { t++; sfx('bad'); if (t >= 2) { b.remove(); say(`Se dice: “${s[0]}”.`); speak(s[0]); setTimeout(() => res(false), 2000); } else say(`Casi. Empieza con “${s[0].split(' ')[0]}”.`); } }); a.append(b); });
        rec(s[0], g, 'grammar'); } },
    async sit(st) { const sc = SIT[L.id]; st.append(h('div', 'place', sc.place)); const say = guideBox(st), a = area(st);
      for (const s of sc.steps) { a.replaceChildren(h('div', 'npc', '“' + s[0] + '”')); speak(s[0]); say('Elige la mejor respuesta.'); const g = await choose(a, sh(s[1]), s[1][s[2]], s[3], say); rec(null, g, 'talk'); } },
    async pron(st) { st.append(h('div', 'place', '🎤 Pronunciación')); const say = guideBox(st), a = area(st), SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      say(SR ? 'Toca el micrófono y di la palabra en voz alta.' : 'Tu navegador no evalúa voz: practica en voz alta y confirma.');
      for (const w of pw(3)) { a.replaceChildren(h('h2', 'big', w[0]), h('p', 'tr', w[1]), h('button', 'btn alt', '🔊 Escuchar modelo', () => speak(w[0]))); speak(w[0]); const heard = h('p', 'tr', ''); const g = await new Promise(res => { let t = 0;
          const mic = h('button', 'mic', '🎤', () => { if (!SR) { rec(w[0], true, null); res(true); return; } const r = new SR(); r.lang = 'en-US'; mic.classList.add('on'); heard.textContent = 'Escuchando…';
            r.onresult = e => { const tx = e.results[0][0].transcript, ok = norm(tx).includes(norm(w[0])); heard.textContent = 'Escuché: “' + tx + '”'; mic.classList.remove('on'); if (ok) { sfx('good'); say(pick(PRAISE)); setTimeout(() => res(true), 900); } else { t++; sfx('bad'); if (t >= 2) { say('Sigue practicando: ' + w[0]); setTimeout(() => res(false), 1500); } else say('Casi. Escucha el modelo e inténtalo de nuevo.'); } };
            r.onerror = () => { mic.classList.remove('on'); heard.textContent = 'No te escuché. Revisa el permiso del micrófono.'; }; r.onend = () => mic.classList.remove('on'); try { r.start(); } catch (e) {} });
          a.append(mic, heard); }); if (SR) rec(w[0], g, 'speak'); } },
    async timed(st) { st.append(h('div', 'place', '⏱ ¡Contrarreloj!')); const say = guideBox(st), a = area(st); say('¡Rápido! Tienes 6 segundos por pregunta.');
      for (const w of pw(5)) { a.replaceChildren(); const dir = Math.random() < .5, tm = h('div', 'timer'), bar = h('i'); tm.append(bar); a.append(tm, h('h2', 'big', dir ? w[1] : w[0])); if (!dir) speak(w[0]);
        bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = 'width 6s linear'; bar.style.width = '0%'; let clicked = false; a.addEventListener('click', () => clicked = true, true);
        const g = await Promise.race([choose(a, dist(w, dir ? 0 : 1), dir ? w[0] : w[1], explain(w), say, 1), wait(6000).then(() => clicked ? new Promise(() => {}) : null)]);
        if (g === null) { sfx('bad'); say('¡Tiempo! ' + explain(w)); await wait(1600); } rec(w[0], g === true, 'read'); } },
    async boss(st) { let hp = 6, hearts = 3; const hud = h('div', 'bosshud'), hb = h('div', 'hp'), hi = h('i'), hr = h('div', 'hearts', '❤❤❤'), bo = h('div', 'boss', '👾'); hi.style.width = '100%'; hb.append(hi); hud.append(bo, hb, hr); st.append(hud);
      const say = guideBox(st), a = area(st); say('¡Aparece el jefe! Respóndele bien 6 veces antes de perder 3 corazones.');
      for (const w of pw(8)) { if (hp <= 0 || hearts <= 0) break; a.replaceChildren(); const f = pick(['pick', 'listen', 'type']); let g;
        if (f === 'type') { a.append(h('h2', 'big', w[1])); g = await typeQ(a, w, say); } else if (f === 'pick') { a.append(h('h2', 'big', w[1])); g = await choose(a, dist(w, 0), w[0], explain(w), say, 1); }
        else { speak(w[0]); a.append(h('button', 'spk', '🔊', () => speak(w[0]))); g = await choose(a, dist(w, 1), w[1], explain(w), say, 1); }
        rec(w[0], g, f === 'type' ? 'write' : f === 'listen' ? 'listen' : 'read'); if (g) { hp--; bo.classList.add('hit'); } else hearts--;
        hi.style.width = hp / 6 * 100 + '%'; hr.textContent = '❤'.repeat(hearts) + '🖤'.repeat(3 - hearts); setTimeout(() => bo.classList.remove('hit'), 400); }
      run.won = hp <= 0; if (run.won) bo.textContent = '💥'; else say('El jefe resistió… ¡repasa y vuelve a intentarlo!'); await wait(1200); }
  };
  async function card(t) { const c = h('div', 'titlecard'); c.append(h('div', 'ic', TITLE[t][0]), h('div', '', TITLE[t][1]), h('small', '', TITLE[t][2])); root.append(c); sfx('click'); await wait(1300); c.remove(); }
  const INTRO = ['¡Hello, amigo! Hoy vamos a jugar con el inglés. ¡Será divertido!', 'Psst… ¿listo para la aventura? ¡Yo te acompaño en cada paso!', '¡Qué emoción! Hoy nos vamos a reír y a aprender juntos.', '¿Preparado? Si te equivocas no pasa nada, ¡así se aprende!', '¡Vamos, campeón! Hoy el inglés será pan comido.'];
  function intro() {
    root.className = 'clear'; root.replaceChildren(); const t = h('div', 'ltop'); t.append(h('button', 'x', '✕', () => { alive = false; root.replaceChildren(); onExit(false); })); root.append(t);
    const c = h('div', 'intro'); c.append(h('div', 'gav big', gem), h('div', 'bub', `${gname}: “${INTRO[[...L.id].reduce((a, c) => a + c.charCodeAt(0), 0) % INTRO.length]}”`), h('h1', '', L.title), h('div', 'badges', ''), h('p', '', '🎯 Aprende a ' + L.goal[0].toLowerCase() + L.goal.slice(1).replace(/ y (?=\p{L}+(ar|er|ir|arte|erte|irte)\b)/iu, ' y a ')));
    c.children[3].append(h('span', 'badge lv', 'Nivel ' + W.lvl), h('span', 'badge', 'Mundo ' + W.id), h('span', 'badge', '⚔ 5 desafíos'), h('span', 'badge', '🎁 hasta ⭐⭐⭐ + XP + 🪙'));
    c.append(h('button', 'play', 'COMENZAR AVENTURA', () => { sfx('click'); start(); })); root.append(c); speak('Hello! Let us begin the adventure!');
  }
  async function start() {
    run = { ok: 0, n: 0, wrong: new Set(), won: false }; const pl = plan(L), order = [...pl, 'boss'];
    root.className = 'solid'; root.replaceChildren(topbar(order.length)); body = h('div', 'body'); root.append(body);
    for (let i = 0; i < order.length; i++) { if (!alive) return; prog.children[i].className = 'c'; let t = order[i];
      if (t === 'surprise') { await card('surprise'); const o = avail(L).filter(k => k !== 'surprise' && !pl.includes(k)); t = pick(o.length ? o : avail(L).filter(k => k !== 'surprise')); }
      await card(t); if (!alive) return; root.className = (t === 'explore' ? 'clear' : 'solid') + (t === 'boss' ? ' boss' : ''); const st = h('div', 'act a-' + t); body.replaceChildren(st); await A[t](st); if (!alive) return; prog.children[i].className = 'd'; }
    S.hist = [...pl, ...S.hist.filter(k => !pl.includes(k))].slice(0, 8); finish();
  }
  function finish() {
    const pct = run.n ? run.ok / run.n : 0, pass = run.won, stars = !pass ? 0 : pct >= .9 ? 3 : pct >= .75 ? 2 : 1, first = pass && !S.done[L.id];
    const xp = run.ok * 10 + (first ? 30 : 0) + (pass ? 20 : 0), coins = run.ok * 2 + (first ? 15 : 0), got = [];
    S.xp += xp; S.coins += coins; if (pass) S.done[L.id] = Math.max(S.done[L.id] || 0, stars);
    const give = (k, t) => { if (!S.ach[k]) { S.ach[k] = 1; got.push(t); S.coins += 10; } };
    if (pass) give('boss', '⚔ Primer jefe vencido'); if (pass && pct === 1) give('perfect', '💎 Lección perfecta'); if (Object.keys(S.done).length >= 3) give('three', '🏅 Tres lecciones completadas');
    save(); sfx(pass ? 'win' : 'bad'); root.className = 'solid'; root.replaceChildren();
    const c = h('div', 'intro result'); c.append(h('div', 'gav big', pass ? '🎉' : gem), h('h1', '', pass ? '¡Aventura superada!' : 'El jefe resistió'), h('div', 'stars', '⭐'.repeat(stars) + '☆'.repeat(3 - stars)),
      h('p', '', `Aciertos: ${run.ok}/${run.n} (${Math.round(pct * 100)}%) · +${xp} XP · +${coins} 🪙`));
    got.forEach(t => c.append(h('div', 'badge lv', '🏆 Logro: ' + t)));
    if (!pass) { c.append(h('p', '', 'Para avanzar debes vencer al jefe. Repasa esto:')); [...run.wrong].slice(0, 6).forEach(k => { const w = ALL.find(x => x[0] === k); if (w) c.append(h('div', 'badge', `${w[0]} = ${w[1]}`)); }); }
    const r = h('div', 'row'); r.append(h('button', 'btn alt', 'Reintentar', () => intro()), h('button', 'btn', 'Volver al mapa', () => { alive = false; root.replaceChildren(); onExit(first); })); c.append(r); root.append(c);
  }
  intro();
}
