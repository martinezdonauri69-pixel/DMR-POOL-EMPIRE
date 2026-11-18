import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
const G = THREE;
const SKY = [0x8fdcff, 0xffb8e8, 0xffd9a0, 0xffc79a, 0x9fd0ff, 0xd0b0ff, 0x7f9cff, 0x9fb7cc];
const GR = [0x4fbf5a, 0x9ee04f, 0xe3b95a, 0x78c56a, 0x7aa0a8, 0x6fd0c0, 0x7a6af0, 0x8c9aa8];
const SEA = [0x1a8fd8, 0xe05fa8, 0xd98a2a, 0x2a9fd0, 0x1b6fc0, 0x3bb7b0, 0x2a3fd0, 0x2a5a86];
const PAL = [0xff5a5a, 0x4aa3ff, 0xffd23f, 0x58d68d, 0xb06bff, 0xff9a3c, 0xff7ac8];
const RIM = [14, 9, 5, 6, 3, 6, 2, 2], TOP = .6;
const TL = new THREE.TextureLoader(), TEX = {};
const OK = {}, WAIT = {};
const tx = (f, n) => { const t = TL.load('assets/' + f, () => { OK[n] = t; (WAIT[n] || []).forEach(fn => fn()); }, undefined, () => {}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.repeat.set(3, 3); return t; };
['grass', 'sand', 'rock'].forEach(n => TEX[n] = tx(n + '.jpg', n));
const GT = ['grass', 'grass', 'sand', 'grass', 'rock', 'grass', 'rock', 'rock'];
const mk = (geo, c, r = .7, m = 0, em = 0) => { const o = new G.Mesh(geo, new G.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: em ? c : 0, emissiveIntensity: em })); o.userData.c = new G.Color(c); o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const pick = a => a[Math.floor(Math.random() * a.length)];

function build(i) {
  const g = new G.Group(), A = { sway: [], bob: [], spin: [], float: [] }; g.userData.A = A;
  const add = (o, x, y, z) => { g.add(at(o, x, y, z)); return o; };
  { const gm = add(mk(new G.CylinderGeometry(7.5, 8, 1.2, 48), GR[i], .85), 0, 0, 0); const nm = GT[i], ap = () => { gm.userData.c = new G.Color(0xffffff).lerp(new G.Color(GR[i]), .2); gm.material.color.copy(gm.userData.c); gm.material.map = OK[nm]; gm.material.needsUpdate = true; }; if (OK[nm]) ap(); else (WAIT[nm] = WAIT[nm] || []).push(ap); }
  add(mk(new G.ConeGeometry(8, 6.5, 32), 0x6b5a4a, 1), 0, -3.85, 0).rotation.x = Math.PI;
  const ring = add(mk(new G.RingGeometry(3.4, 4.4, 56), i > 2 ? 0x555a66 : 0xe9d9a8, .9), 0, TOP + .02, 0); ring.rotation.x = -Math.PI / 2; ring.castShadow = false;
  const tree = (x, z, s = 1, c = 0x2a9d4a, round = false) => {
    const t = new G.Group(); t.add(at(mk(new G.CylinderGeometry(.12 * s, .18 * s, .9 * s, 8), 0x7a4a25), 0, .45 * s, 0));
    if (round) t.add(at(mk(new G.SphereGeometry(.75 * s, 14, 12), c), 0, 1.5 * s, 0));
    else [[.9, 1, 1.1], [.7, 1.9, .9], [.5, 2.6, .7]].forEach(([r, y, h]) => t.add(at(mk(new G.ConeGeometry(r * s, h * s, 10), c), 0, y * s, 0)));
    t.position.set(x, TOP, z); g.add(t); A.sway.push([t, Math.random() * 6]);
  };
  const house = (x, z, c, rc, w = 1.6, h = 1.2, ry = 0) => {
    const b = new G.Group(); b.add(at(mk(new G.BoxGeometry(w, h, w), c, .6), 0, h / 2, 0));
    const r = at(mk(new G.ConeGeometry(w * .85, h * .6, 4), rc), 0, h + h * .3, 0); r.rotation.y = Math.PI / 4; b.add(r);
    b.add(at(mk(new G.BoxGeometry(.35, .6, .05), 0x5a3a20), 0, .3, w / 2));
    b.add(at(mk(new G.BoxGeometry(.3, .3, .05), 0xffe27a, .3, 0, 1), -.45, h * .65, w / 2 + .01)); b.position.set(x, TOP, z); b.rotation.y = ry; g.add(b);
  };
  const tower = (x, z, w, h, c) => {
    const b = new G.Group(); b.add(at(mk(new G.BoxGeometry(w, h, w), c, .2, .6), 0, h / 2, 0));
    for (let k = 1; k < h; k += .8) b.add(at(mk(new G.BoxGeometry(w + .02, .18, w + .02), 0xfff2a8, .3, 0, .9), 0, k, 0));
    b.add(at(mk(new G.CylinderGeometry(.04, .04, .8, 6), 0xcccccc), 0, h + .4, 0)); b.position.set(x, TOP, z); g.add(b);
  };
  const mount = (x, z, s, c = 0x7d8a99) => {
    const m = new G.Group(); m.add(at(mk(new G.ConeGeometry(2 * s, 3.4 * s, 7), c, .95), 0, 1.7 * s, 0)); m.add(at(mk(new G.ConeGeometry(.9 * s, 1.1 * s, 7), 0xffffff, .6), 0, 3 * s, 0)); m.position.set(x, TOP, z); g.add(m);
  };
  const char = (x, z, c) => {
    const p = new G.Group(); p.add(at(mk(new G.CylinderGeometry(.22, .3, .75, 12), c), 0, .38, 0)); p.add(at(mk(new G.SphereGeometry(.26, 14, 12), 0xffd7b0), 0, 1, 0));
    p.add(at(mk(new G.SphereGeometry(.06, 6, 6), 0x111111), -.09, 1.04, .22)); p.add(at(mk(new G.SphereGeometry(.06, 6, 6), 0x111111), .09, 1.04, .22));
    p.position.set(x, TOP, z); g.add(p); A.bob.push([p, Math.random() * 6]);
  };
  const books = (x, z) => { for (let k = 0; k < 5; k++) { const b = add(mk(new G.BoxGeometry(1.5 - k * .1, .24, 1.1), pick(PAL)), x, TOP + .12 + k * .24, z); b.rotation.y = (Math.random() - .5) * .8; } };
  const ringArc = (r, c, y) => { const t = add(mk(new G.TorusGeometry(r, .22, 10, 40, Math.PI), c, .4), 0, TOP + y, -2.5); return t; };
  const crystal = (x, z, c, s = 1) => { const o = add(mk(new G.OctahedronGeometry(.5 * s), c, .1, .3, .5), x, TOP + .9 * s, z); o.scale.y = 2; A.float.push([o, Math.random() * 6, TOP + .9 * s]); };
  // montañas al fondo
  if ([0, 1, 2, 5, 6].includes(i)) for (let k = 0; k < 4; k++) { const a = Math.PI * (1.15 + k * .23); mount(Math.cos(a) * 6.2, Math.sin(a) * 6.2, .8 + Math.random() * .6, i === 6 ? 0x6a5acd : 0x7d8a99); }
  for (let k = 0; k < RIM[i]; k++) { const a = Math.random() * 6.28, r = 5.2 + Math.random() * 1.7; tree(Math.cos(a) * r, Math.sin(a) * r, .7 + Math.random() * .6, i === 1 ? pick(PAL) : i === 5 ? 0x2ac9a0 : 0x2a9d4a, i === 1 || i === 3); }
  if (i === 0) { house(0, -1.2, 0xfff1d0, 0xd94b3b, 3, 1.7); add(mk(new G.CylinderGeometry(.04, .04, 2.4, 6), 0xdddddd), 1.8, TOP + 1.2, -1.2); add(mk(new G.BoxGeometry(.7, .4, .03), 0xff5fa2), 2.15, TOP + 2.2, -1.2); char(-1.5, 1.8, 0x4aa3ff); char(0, 2.4, 0xff5a5a); char(1.6, 1.6, 0x58d68d); }
  if (i === 1) { [0xff5a5a, 0xff9a3c, 0xffd23f, 0x58d68d, 0x4aa3ff].forEach((c, k) => ringArc(3.2 - k * .4, c, 0)); add(mk(new G.SphereGeometry(.9, 18, 14), 0xe8302a, .3), -2.2, TOP + .9, 1.2); add(mk(new G.SphereGeometry(.7, 18, 14), 0x58d68d, .4), 2.4, TOP + .7, 1.4);
    [[-1, 2.2, 0xffc890], [1, 2.6, 0xb0b0b0], [0, 1.2, 0xff9a3c]].forEach(([x, z, c]) => { add(mk(new G.BoxGeometry(.8, .6, .9), c), x, TOP + .5, z); add(mk(new G.SphereGeometry(.4, 12, 10), c), x, TOP + 1.05, z + .5); add(mk(new G.ConeGeometry(.12, .3, 4), 0x333333), x - .2, TOP + 1.5, z + .5); add(mk(new G.ConeGeometry(.12, .3, 4), 0x333333), x + .2, TOP + 1.5, z + .5); }); }
  if (i === 2) { books(-2.5, -1); books(2.4, -.4); books(-1, 2.6); for (let k = 0; k < 5; k++) add(mk(new G.BoxGeometry(.9, .9, .9), PAL[k]), 1 + k % 2 * .9, TOP + .45 + Math.floor(k / 2) * .9, 2.2); [-1.2, 0, 1.2].forEach(x => add(mk(new G.CylinderGeometry(.28, .32, 2.4, 12), 0xf5efe0), x, TOP + 1.2, -3)); add(mk(new G.BoxGeometry(4, .35, 1.2), 0xf5efe0), 0, TOP + 2.55, -3); char(0, 1, 0xb06bff); }
  if (i === 3) { for (let k = 0; k < 6; k++) { const a = k * 1.05 + .3; house(Math.cos(a) * 5, Math.sin(a) * 5, pick([0xfff1d0, 0xffd0d8, 0xd0e8ff, 0xd8ffd0]), pick([0xd94b3b, 0x3b7dd9, 0x8a4bd9]), 1.4, 1.1, -a + Math.PI / 2); }
    add(mk(new G.BoxGeometry(2, 1.2, 1.4), 0xffe9b8), 0, TOP + .6, -1); add(mk(new G.BoxGeometry(2.3, .1, .9), 0xe8302a), 0, TOP + 1.2, -.1).rotation.x = .3; [-2, 2].forEach(x => { add(mk(new G.CylinderGeometry(.05, .05, 1.6, 6), 0x333333), x, TOP + .8, 1.6); add(mk(new G.SphereGeometry(.18, 8, 8), 0xfff2a8, .3, 0, 1), x, TOP + 1.7, 1.6); }); char(1, 2, 0xff9a3c); char(-1, 2.3, 0x4aa3ff); }
  if (i === 4) { tower(-2.4, -2, 1.3, 4.2, 0x6f8fe0); tower(.2, -3, 1.1, 3, 0x8fb4ff); tower(2.6, -2.2, 1.2, 3.6, 0x7a9cf0); const p = new G.Group(); const f = mk(new G.CylinderGeometry(.35, .35, 2.2, 12), 0xffffff, .3); f.rotation.z = Math.PI / 2; p.add(f); p.add(at(mk(new G.BoxGeometry(.5, .06, 2.4), 0xe8302a), .1, 0, 0)); p.add(at(mk(new G.BoxGeometry(.4, .6, .06), 0xe8302a), -1, .4, 0)); p.position.set(-.5, TOP + 1.6, 2); g.add(p); A.float.push([p, 1, TOP + 1.6]); add(mk(new G.BoxGeometry(4.5, .05, 1), 0x2b2f3a), -.5, TOP + .05, 2); house(2.6, 1.5, 0xffe9b8, 0xe8302a, 1.5, 1); char(1.4, 2.8, 0x58d68d); }
  if (i === 5) { add(mk(new G.CylinderGeometry(1.3, 1.5, .5, 24), 0xcfd8e6), 0, TOP + .25, 0); add(mk(new G.CylinderGeometry(1.1, 1.1, .3, 24), 0x3aa8ff, .1, .2), 0, TOP + .55, 0); add(mk(new G.CylinderGeometry(.15, .2, 1.4, 10), 0xcfd8e6), 0, TOP + 1.2, 0); add(mk(new G.SphereGeometry(.4, 12, 10), 0x7fd8ff, .1, 0, .3), 0, TOP + 2, 0);
    for (let k = 0; k < 4; k++) { const b = add(mk(new G.SphereGeometry(.38, 12, 10), 0xffffff, .2), Math.cos(k * 1.6) * 2.6, TOP + 3, Math.sin(k * 1.6) * 2.6); b.material.transparent = true; b.material.opacity = .85; A.float.push([b, k * 1.5, TOP + 3]); }
    for (let k = 0; k < 5; k++) { const a = k * 1.25; house(Math.cos(a) * 5.1, Math.sin(a) * 5.1, pick([0xfff1d0, 0xffd0d8, 0xd0e8ff]), 0x2ac9a0, 1.3, 1, -a + Math.PI / 2); } [[2, 1, 0xff5a5a], [-2, 1.4, 0x4aa3ff], [0, 2.8, 0xffd23f], [-2.3, -1.6, 0xb06bff], [2.4, -1.4, 0x58d68d]].forEach(([x, z, c]) => char(x, z, c)); }
  if (i === 6) { add(mk(new G.ConeGeometry(.8, 6, 6), 0xbfa8ff, .1, .8, .25), 0, TOP + 3, 0); for (let k = 0; k < 3; k++) { const t = add(mk(new G.TorusGeometry(1.6 + k * .7, .08, 8, 48), [0x38e1ff, 0xff5fa2, 0xffe27a][k], .2, .6, .6), 0, TOP + 2 + k, 0); t.rotation.x = Math.PI / 2 + k * .25; A.spin.push([t, .5 + k * .3]); }
    const d = add(mk(new G.SphereGeometry(1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), 0x9fe8ff, .05, .3), 3.2, TOP, 2); d.material.transparent = true; d.material.opacity = .5; [[-3, 2, 0xff5fa2], [-2, -2.4, 0x38e1ff], [2.8, -2.6, 0xffe27a], [-4, .5, 0x9fff9a]].forEach(([x, z, c]) => crystal(x, z, c, 1.2)); char(-1.4, 1.6, 0x38e1ff); }
  if (i === 7) { tower(0, -1.2, 1.8, 6.2, 0x9fd3ff); add(mk(new G.SphereGeometry(.6, 16, 12), 0x38e1ff, .1, .3, .5), 0, TOP + 7, -1.2); [[-2.6, -1.5, 1.3, 3.6], [2.6, -1.8, 1.3, 4.4], [-2.2, 1.6, 1.2, 2.6], [2.4, 1.4, 1.2, 3.2], [4.2, -.2, 1, 2.2]].forEach(([x, z, w, h], k) => tower(x, z, w, h, [0x6f8fe0, 0x8fb4ff, 0x7a9cf0][k % 3])); const hp = add(mk(new G.CylinderGeometry(1, 1, .12, 24), 0x444a58), 0, TOP + .06, 2.6); void hp; char(-.6, 1.8, 0x23262e); char(.6, 2, 0x4a4f60); }
  return g;
}
export function initScene(canvas, onSwipe) {
  const r = new G.WebGLRenderer({ canvas, antialias: true }); r.shadowMap.enabled = true; r.shadowMap.type = G.PCFSoftShadowMap; r.toneMapping = G.ACESFilmicToneMapping;
  const sc = new G.Scene(), cam = new G.PerspectiveCamera(45, 1, .1, 300), bg = new G.Color(SKY[0]); sc.background = bg; sc.fog = new G.Fog(bg, 30, 90);
  const hemi = new G.HemisphereLight(0xffffff, 0x334466, 1.1); sc.add(hemi);
  const sun = new G.DirectionalLight(0xfff0d0, 2.2); sun.position.set(10, 18, 8); sun.castShadow = true; Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 4; sc.add(sun);
  const wn = (() => { const n = 128, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), im = x.createImageData(n, n), T = 6.283, H = (u, v) => Math.sin(u * T * 3 + Math.sin(v * T * 2) * 1.5) + Math.sin(v * T * 4 + Math.sin(u * T * 3)) * .7;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const u = i / n, v = j / n, e = 1 / n, dx = (H(u + e, v) - H(u - e, v)) * 8, dy = (H(u, v + e) - H(u, v - e)) * 8, l = Math.hypot(dx, dy, 1), k = (j * n + i) * 4; im.data[k] = (-dx / l * .5 + .5) * 255; im.data[k + 1] = (-dy / l * .5 + .5) * 255; im.data[k + 2] = (1 / l * .5 + .5) * 255; im.data[k + 3] = 255; }
    x.putImageData(im, 0, 0); const t = new G.CanvasTexture(c); t.wrapS = t.wrapT = G.RepeatWrapping; t.repeat.set(140, 140); return t; })();
  const sea = new G.Mesh(new G.PlaneGeometry(400, 400), new G.MeshStandardMaterial({ color: SEA[0], roughness: .12, metalness: .4, normalMap: wn, normalScale: new G.Vector2(.15, .15), envMapIntensity: 1 }));
  new RGBELoader().load('assets/sky.hdr', h => { h.mapping = G.EquirectangularReflectionMapping; sc.background = h; sc.environment = h; sc.environmentIntensity = .6; }, undefined, () => {}); sea.rotation.x = -Math.PI / 2; sea.position.y = -5.5; sea.receiveShadow = true; sc.add(sea);
  const N = 140, pa = new Float32Array(N * 3).map(() => (Math.random() - .5) * 22), pg = new G.BufferGeometry(); pg.setAttribute('position', new G.BufferAttribute(pa, 3));
  const pm = new G.PointsMaterial({ color: 0xffffff, size: .22, transparent: true, opacity: .85, depthWrite: false }); sc.add(new G.Points(pg, pm));
  let zf = 1, zt = 1, cur = null, tw = null, idx = 0, locked = false, t = 0, dock = null, last = performance.now(), swipe = null;
  const tgt = new G.Color(SKY[0]), tgs = new G.Color(SEA[0]), gray = new G.Color(0x606880);
  const tint = (g, lk) => g.traverse(o => { if (o.isMesh) o.material.color.copy(o.userData.c).lerp(gray, lk ? .7 : 0); });
  function resize() {
    const w = innerWidth, h = innerHeight; r.setPixelRatio(Math.min(devicePixelRatio, canvas.dataset.q === 'low' ? 1 : 2)); r.setSize(w, h, false); cam.aspect = w / h;
    dock = dock || document.getElementById('dock'); const off = Math.max(0, (dock.offsetHeight - 56) / 2); cam.setViewOffset(w, h, 0, off, w, h);
    cam.userData.d = Math.min(46, Math.max(19, 7.6 / (Math.tan(22.5 * Math.PI / 180) * cam.aspect))); cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  canvas.addEventListener('pointerdown', e => swipe = e.clientX);
  canvas.addEventListener('pointerup', e => { if (swipe != null && Math.abs(e.clientX - swipe) > 60) onSwipe(e.clientX < swipe ? 1 : -1); swipe = null; });
  function show(i, dir, lk) {
    sc.children.filter(o => o.userData && o.userData.isl && o !== cur).forEach(o => { o.traverse(m => { if (m.isMesh) { m.geometry.dispose(); m.material.dispose(); } }); sc.remove(o); });
    if (cur) { cur.position.x = 0; cur.rotation.y = 0; cur.scale.setScalar(1); } tw = null;
    const first = !cur, old = cur; idx = i; locked = lk; cur = build(i); cur.userData.isl = 1; tint(cur, lk); sc.add(cur); tgt.set(SKY[i]); tgs.set(SEA[i]); pm.color.setHex(i === 6 ? 0x9fe8ff : i === 1 ? 0xffe0f4 : i < 3 ? 0xfff6a8 : 0xffffff);
    if (first) { bg.copy(tgt); sea.material.color.copy(tgs); return; }
    tw = { old, t: 0, dir: dir || 1 }; cur.position.x = tw.dir * 60; cur.scale.setScalar(.6);
  }
  function setLocked(lk) { locked = lk; if (cur) tint(cur, lk); }
  function dispose(g) { g.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); sc.remove(g); }
  (function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; zf += (zt - zf) * .045; const D = cam.userData.d, d = D * zf, a = Math.sin(t * .13) * .5 + .15;
    cam.position.set(Math.sin(a) * d * .8, d * .5 + Math.sin(t * .2), Math.cos(a) * d * .8); cam.lookAt(0, 1.2, 0);
    bg.lerp(tgt, .05); sc.fog.color.copy(bg); wn.offset.x += dt * .02; wn.offset.y += dt * .012; sea.material.color.lerp(tgs, .05); hemi.color.copy(bg).lerp(new G.Color(0xffffff), .5); sc.fog.near = D * 1.1; sc.fog.far = D * 3.2;
    if (tw) { tw.t += dt / .9; const k = Math.min(1, tw.t), e = 1 - Math.pow(1 - k, 3), s = 1 + Math.sin(k * Math.PI) * .06;
      tw.old.position.x = -tw.dir * 60 * e; tw.old.scale.setScalar(1 - .45 * e); tw.old.rotation.y = -tw.dir * e * .8; cur.position.x = tw.dir * 60 * (1 - e); cur.rotation.y = tw.dir * (1 - e) * .8; cur.scale.setScalar((.6 + .4 * e) * s);
      if (k >= 1) { dispose(tw.old); cur.position.x = 0; cur.rotation.y = 0; cur.scale.setScalar(1); tw = null; } }
    if (cur) { const A = cur.userData.A;
      A.sway.forEach(([o, p]) => { o.rotation.z = Math.sin(t * 1.4 + p) * .04; o.rotation.x = Math.cos(t * 1.1 + p) * .03; });
      A.bob.forEach(([o, p]) => { o.position.y = TOP + Math.abs(Math.sin(t * 2.5 + p)) * .12; o.rotation.y = Math.sin(t + p) * .5; });
      A.spin.forEach(([o, s]) => { o.rotation.z += dt * s; }); A.float.forEach(([o, p, y]) => { o.position.y = y + .25 + Math.sin(t * 1.6 + p) * .25; o.rotation.y += dt * .6; }); }
    const pp = pg.attributes.position; for (let k = 0; k < N; k++) { pp.array[k * 3 + 1] += dt * .6; pp.array[k * 3] += Math.sin(t + k) * dt * .15; if (pp.array[k * 3 + 1] > 11) pp.array[k * 3 + 1] = -2; } pp.needsUpdate = true;
    r.render(sc, cam); requestAnimationFrame(loop);
  })(last);
  return { zoom(on) { zt = on ? .4 : 1; }, show, setLocked, setQuality(q) { canvas.dataset.q = q; resize(); } };
}
