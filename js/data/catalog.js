/* catalog.js · todo lo que se vende en la tienda.
   Cada artículo: { id, cat, n:(clave de idioma), pc:(precio en monedas) | gm:(precio en gemas), ...apariencia }
   Las 30 paletas 3D se definen en la tabla PADS (nombre, precio, ventaja, efecto y diseño). */
export const CATS = ['pad', 'bl', 'tb', 'fx', 'pw'];

/* ---------------------------------------------------------------- PALETAS
   [id, nombre, nivel(0-4), precio, ventaja('pr'|'ct'|'sp'|''), %, movimiento del efecto, [claro, medio, oscuro], dibujo, extra, colores de partículas]
   pr = precisión (la paleta sigue mejor tu dedo) · ct = control (ángulo de devolución) · sp = velocidad (movimiento)
   REGLAS: la ventaja máxima es 5 %, no se suma entre paletas (solo cuenta la equipada) y NINGUNA cambia el tamaño ni el área de golpe. */
const PADS = [
  ['pd_clasica', 'Clásica', 0, 0, '', 0, 'none', ['#a8dcff', '#2f7bff', '#0a2a8a'], 'stripe', '', null],
  ['pd_rayo', 'Rayo Azul', 0, 70, 'ct', 1, 'jitter', ['#d0f4ff', '#19b5ff', '#0a3a9a'], 'lines', '', null],
  ['pd_fuego', 'Fuego Básico', 0, 80, 'sp', 1, 'rise', ['#ffe08a', '#ff5a1f', '#8a1008'], 'waves', '', null],
  ['pd_hielo', 'Hielo', 0, 90, 'pr', 1, 'fall', ['#ecfcff', '#6fd6ff', '#1f6fb8'], 'hex', '', null],
  ['pd_veneno', 'Veneno', 0, 100, 'ct', 1, 'rise', ['#eaffb4', '#3ddc2a', '#145a10'], 'dots', '', null],
  ['pd_neon', 'Neón', 0, 120, '', 0, 'glow', ['#ffd6ff', '#c03cff', '#4a0a8a'], 'lines', 'fxonly', null],
  ['pd_dorado', 'Dorado', 1, 150, 'pr', 2, 'twinkle', ['#fff3b0', '#ffc21a', '#8a5a00'], 'diamonds', '', null],
  ['pd_sombras', 'Sombras', 1, 150, 'ct', 2, 'drift', ['#7a5aaa', '#2a1650', '#07030f'], 'dots', '', ['#b57bff', '#6a3dff']],
  ['pd_cyber', 'Cyber', 1, 180, 'sp', 2, 'jitter', ['#c4f9ff', '#19d3ff', '#0a4a6a'], 'circuit', '', null],
  ['pd_lava', 'Lava', 1, 200, 'pr', 2, 'rise', ['#ffe08a', '#ff6a00', '#4a0a00'], 'waves', '', null],
  ['pd_espacial', 'Espacial', 1, 220, 'ct', 2, 'twinkle', ['#cdd4ff', '#4a5cff', '#150a4a'], 'stars', '', null],
  ['pd_aurora', 'Aurora', 1, 250, 'sp', 2, 'orbit', ['#a8ffd8', '#7a6cff', '#ff6ad8'], 'waves', '', null],
  ['pd_diamante', 'Diamante', 2, 280, 'pr', 3, 'twinkle', ['#ffffff', '#6fd6ff', '#2a7ad8'], 'diamonds', '', null],
  ['pd_infernal', 'Infernal', 2, 300, 'ct', 3, 'rise', ['#ff9a8a', '#e0243a', '#2a0006'], 'checker', '', null],
  ['pd_electrica', 'Eléctrica', 2, 320, 'sp', 3, 'jitter', ['#fff6a0', '#ffd21f', '#8a5a00'], 'lines', '', null],
  ['pd_glacial', 'Glacial Pro', 2, 340, 'pr', 3, 'fall', ['#ffffff', '#9fe8ff', '#2f8ad8'], 'hex', '', null],
  ['pd_fantasma', 'Fantasma', 2, 360, 'ct', 3, 'drift', ['#f2e4ff', '#a07cff', '#3a1a8a'], 'dots', '', null],
  ['pd_quantum', 'Quantum', 2, 380, 'sp', 3, 'orbit', ['#b8c0ff', '#7a3dff', '#1a0a6a'], 'lines', '', null],
  ['pd_cibernetica', 'Cibernética', 3, 400, 'pr', 4, 'jitter', ['#d4f9ff', '#2fa8ff', '#ff3df2'], 'circuit', '', null],
  ['pd_solar', 'Solar', 3, 420, 'sp', 4, 'rise', ['#fff0a0', '#ff9a1a', '#c02a00'], 'rays', '', null],
  ['pd_vortice', 'Vórtice', 3, 440, 'ct', 4, 'orbit', ['#e4b8ff', '#9b3dff', '#2a0a6a'], 'waves', '', null],
  ['pd_nebulosa', 'Nebulosa', 3, 460, 'pr', 4, 'orbit', ['#ffb8f4', '#6a3dff', '#0a1a8a'], 'stars', '', null],
  ['pd_tornado', 'Tornado', 3, 480, 'sp', 4, 'orbit', ['#d4f6ff', '#4dc8ff', '#1a6ab8'], 'waves', '', null],
  ['pd_galaxia', 'Galaxia', 3, 500, 'ct', 4, 'twinkle', ['#ccaaff', '#4a2dd8', '#0a0a3a'], 'stars', '', ['#c8a0ff', '#6a8aff', '#ffffff']],
  ['pd_draconica', 'Dracónica', 4, 600, 'pr', 4, 'rise', ['#ff9a6a', '#c01a2a', '#3a0008'], 'scales', 'fire', ['#ff5a1f', '#ffb000', '#ff2d4f']],
  ['pd_arcangel', 'Arcángel', 4, 650, 'ct', 4, 'twinkle', ['#ffffff', '#bfe8ff', '#ffd9a0'], 'dots', 'light', ['#ffffff', '#fff3b0', '#bfe8ff']],
  ['pd_kasumi', 'Kasumi', 4, 700, 'sp', 4, 'orbit', ['#ffd6f2', '#ff4da6', '#8a0a5a'], 'waves', 'energy', ['#ff4da6', '#ffd0f0', '#ff8ad0']],
  ['pd_demoniaca', 'Demoníaca', 4, 750, 'pr', 4, 'rise', ['#ff6a4a', '#6a0a1a', '#10000a'], 'checker', 'hell', ['#ff2d2d', '#ff7a1a', '#7a00ff']],
  ['pd_legendaria', 'Legendaria Plus', 4, 800, 'ct', 5, 'twinkle', ['#fffbd0', '#ffc21a', '#b05a00'], 'diamonds', 'gold', ['#ffd21f', '#fff6b0', '#ffffff']],
  ['pd_infinita', 'Infinita', 4, 900, 'pr', 5, 'orbit', ['#ff4da6', '#19d3ff', '#ffd21f'], 'waves', 'cosmic', ['#ff4da6', '#19d3ff', '#ffd21f', '#8a5aff']],
];
const mkPad = ([id, name, tier, pc, k, pct, m, c, pat, ex, fc]) => ({
  id, cat: 'pad', name, tier, pc, st: { pr: k === 'pr' ? pct / 100 : 0, ct: k === 'ct' ? pct / 100 : 0, sp: k === 'sp' ? pct / 100 : 0 },
  m, c, pat, ex, fc: fc || [c[1], c[0]], col: c[1],
});
const PAD_ITEMS = PADS.map(mkPad);
/* paleta del rival cuando no tiene una equipada (bot, 2 jugadores): no se vende */
export const RIVAL_PAD = mkPad(['pd_rival', 'Rival', 0, 0, '', 0, 'none', ['#ffd0d8', '#ff2d4f', '#5a0814'], 'stripe', '', null]);
export const ZERO_ST = { pr: 0, ct: 0, sp: 0 };
/* ventajas de una paleta (si pasas "owned", solo cuenta si de verdad la tienes) */
export function padStats(id, owned) {
  const it = ITEMS.find((x) => x.id === id);
  if (!it || it.cat !== 'pad') return ZERO_ST;
  if (owned && !(it.pc === 0 || owned.includes(id))) return ZERO_ST;
  return it.st;
}

export const ITEMS = [
  ...PAD_ITEMS,
  /* ---- pelotas (colores + dibujo) ---- */
  { id: 'bl_white', cat: 'bl', n: 'it_bl_white', pc: 0, cols: ['#ffffff', '#9fc0ff'], st: '' },
  { id: 'bl_orange', cat: 'bl', n: 'it_bl_orange', pc: 100, cols: ['#ff8a1a', '#ffd9a0'], st: 'r' },
  { id: 'bl_fire', cat: 'bl', n: 'it_bl_fire', pc: 250, cols: ['#ff3a1a', '#ffd400'], st: 'f' },
  { id: 'bl_ice', cat: 'bl', n: 'it_bl_ice', pc: 250, cols: ['#9fe8ff', '#ffffff'], st: 'i' },
  { id: 'bl_star', cat: 'bl', n: 'it_bl_star', pc: 300, cols: ['#ffd400', '#fff6b0'], st: 'e' },
  { id: 'bl_heart', cat: 'bl', n: 'it_bl_heart', pc: 300, cols: ['#ff4d8d', '#ffd0e0'], st: 'c' },
  { id: 'bl_neon', cat: 'bl', n: 'it_bl_neon', pc: 450, cols: ['#19e6a0', '#00ffd0'], st: 'n' },
  { id: 'bl_planet', cat: 'bl', n: 'it_bl_planet', pc: 600, cols: ['#4d7bff', '#ffd9a0'], st: 'p' },
  { id: 'bl_diamond', cat: 'bl', n: 'it_bl_diamond', pc: 800, cols: ['#bff3ff', '#2fb8ff'], st: 'd' },
  { id: 'bl_sun', cat: 'bl', n: 'it_bl_sun', pc: 900, cols: ['#ffc21a', '#ff7a00'], st: 's' },
  { id: 'bl_rainbow', cat: 'bl', n: 'it_bl_rainbow', gm: 30, cols: ['#ffffff', '#ffffff'], st: 'a' },
  { id: 'bl_void', cat: 'bl', n: 'it_bl_void', gm: 45, cols: ['#5b00ff', '#00e5ff'], st: 'n' },
  /* ---- mesas ---- */
  { id: 'tb_blue', cat: 'tb', n: 'it_tb_blue', pc: 0, cols: ['#0a1a6a', '#2a6bff'], st: 'hex', acc: '#2f7bff' },
  { id: 'tb_green', cat: 'tb', n: 'it_tb_green', pc: 150, cols: ['#04442a', '#19c78a'], st: '', acc: '#19e6a0' },
  { id: 'tb_red', cat: 'tb', n: 'it_tb_red', pc: 200, cols: ['#4a0610', '#e0243a'], st: 'diag', acc: '#ff2d4f' },
  { id: 'tb_violet', cat: 'tb', n: 'it_tb_violet', pc: 250, cols: ['#2a0a5a', '#8b3dff'], st: 'circles', acc: '#b57bff' },
  { id: 'tb_black', cat: 'tb', n: 'it_tb_black', pc: 300, cols: ['#050505', '#2a2a36'], st: 'dots', acc: '#e8f0ff' },
  { id: 'tb_ocean', cat: 'tb', n: 'it_tb_ocean', pc: 400, cols: ['#02305a', '#19b5e6'], st: 'waves', acc: '#19d3ff' },
  { id: 'tb_gold', cat: 'tb', n: 'it_tb_gold', pc: 600, cols: ['#4a3200', '#e8a10c'], st: 'hex', acc: '#ffc21a' },
  { id: 'tb_galaxy', cat: 'tb', n: 'it_tb_galaxy', pc: 750, cols: ['#0a0230', '#6a1fd8'], st: 'stars', acc: '#ff3df2' },
  { id: 'tb_candy', cat: 'tb', n: 'it_tb_candy', gm: 30, cols: ['#ff5aa5', '#ffd0e6'], st: 'dots', acc: '#ff3df2' },
  { id: 'tb_lava', cat: 'tb', n: 'it_tb_lava', gm: 40, cols: ['#2a0000', '#ff4a00'], st: 'waves', acc: '#ffb000' },
  /* ---- efectos de golpe ---- */
  { id: 'fx_std', cat: 'fx', n: 'it_fx_std', pc: 0, cols: [] },
  { id: 'fx_gold', cat: 'fx', n: 'it_fx_gold', pc: 200, cols: ['#ffd400', '#fff6b0', '#ffb000'] },
  { id: 'fx_ice', cat: 'fx', n: 'it_fx_ice', pc: 250, cols: ['#9fe8ff', '#ffffff', '#4dc8ff'] },
  { id: 'fx_fire', cat: 'fx', n: 'it_fx_fire', pc: 300, cols: ['#ff3a1a', '#ff9a1a', '#ffd400'] },
  { id: 'fx_toxic', cat: 'fx', n: 'it_fx_toxic', pc: 400, cols: ['#7cff1a', '#19e6a0', '#e8ff9a'] },
  { id: 'fx_royal', cat: 'fx', n: 'it_fx_royal', pc: 600, cols: ['#9b4dff', '#ff3df2', '#ffffff'] },
  { id: 'fx_rainbow', cat: 'fx', n: 'it_fx_rainbow', gm: 25, cols: ['#ff2233', '#ffd400', '#19e68c', '#2a6bff', '#ff3df2'] },
  { id: 'fx_galaxy', cat: 'fx', n: 'it_fx_galaxy', gm: 35, cols: ['#5b00ff', '#00e5ff', '#ffffff', '#ff3df2'] },
  /* ---- potenciadores (se gastan) ---- */
  { id: 'pw_shield', cat: 'pw', n: 'it_pw_shield', gm: 6, ic: '🛡️', d: 'it_pw_shield_d' },
  { id: 'pw_boost', cat: 'pw', n: 'it_pw_boost', gm: 6, ic: '🚀', d: 'it_pw_boost_d' },
];
export const item = (id) => ITEMS.find((x) => x.id === id);
export const DEFAULT_EQ = { pad: 'pd_clasica', bl: 'bl_white', tb: 'tb_blue', fx: 'fx_std' };

/* resuelve lo equipado a los datos que necesita el renderizador 3D (oppPadId = paleta del rival en línea) */
export function lookFor(eq, owned, oppPadId) {
  const g = (cat) => { const id = eq && eq[cat]; const it = item(id); return it && it.cat === cat && (it.pc === 0 || (owned || []).includes(id)) ? it : item(DEFAULT_EQ[cat]); };
  const p = g('pad'), b = g('bl'), t = g('tb'), f = g('fx');
  const op = item(oppPadId); const oppPad = op && op.cat === 'pad' ? op : RIVAL_PAD;
  return { padCol: p.col, pad: p, oppPad, ballCols: b.cols, ballStyle: b.st, tableCols: t.cols, tableStyle: t.st, tableAccent: t.acc, fxCols: f.cols };
}

/* paletas viejas (de color): se quitan del inventario y se devuelve lo que costaron */
const OLD_PADS = { pad_red: [0, 0], pad_cyan: [120, 0], pad_green: [120, 0], pad_gold: [300, 0], pad_violet: [300, 0], pad_pink: [350, 0], pad_orange: [350, 0], pad_lime: [500, 0], pad_white: [600, 0], pad_ice: [800, 0], pad_plasma: [0, 25], pad_royal: [0, 40] };
export function migratePads(p) {
  let pc = 0, gm = 0, any = false;
  if (Array.isArray(p.inv)) p.inv = p.inv.filter((id) => { const o = OLD_PADS[id]; if (!o) return true; pc += o[0]; gm += o[1]; any = true; return false; });
  if (p.eq && OLD_PADS[p.eq.pad]) { p.eq.pad = ''; any = true; }
  if (!any) return null;
  p.pc = (p.pc || 0) + pc; p.gems = (p.gems || 0) + gm;
  return { pc, gm };
}
