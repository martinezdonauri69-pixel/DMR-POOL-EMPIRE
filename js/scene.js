import * as THREE from 'three';
const POS = [[-12, 4], [-6, 7], [0, 4], [6, 7], [12, 4], [7, -3], [0, -6], [-7, -3]];
const GRASS = [0x5ec96b, 0x8bd650, 0x57c7a5, 0xf0b85a, 0x6fb3e8, 0xb07be0, 0xe8825a, 0x7a9cc9];
const mk = (geo, color, rough = .7) => { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: rough })); m.userData.c = new THREE.Color(color); m.castShadow = m.receiveShadow = true; return m; };
const put = (o, x, y, z) => { o.position.set(x, y, z); return o; };

function tree(g, x, z, s = 1) {
  g.add(put(mk(new THREE.CylinderGeometry(.1 * s, .14 * s, .7 * s, 8), 0x7a4a25), x, .75, z));
  g.add(put(mk(new THREE.ConeGeometry(.45 * s, 1.1 * s, 10), 0x1f8a3c), x, 1.5 * s, z));
  g.add(put(mk(new THREE.ConeGeometry(.35 * s, .9 * s, 10), 0x2aa84a), x, 2.05 * s, z));
}
function building(g, x, z, w, h, c) { g.add(put(mk(new THREE.BoxGeometry(w, h, w), c, .3), x, .4 + h / 2, z)); }
function decorate(g, i) {
  if (i === 0 || i === 1) { tree(g, -1.2, .4); tree(g, 1, -.8, 1.2); tree(g, .3, 1.3, .8);
    if (i === 1) [0xff5555, 0x55aaff, 0xffcc33].forEach((c, k) => g.add(put(mk(new THREE.BoxGeometry(.9, .25, .6), c), -.3 + k * .15, .55 + k * .25, -.2))); }
  if (i === 2) [0xc44bff, 0x4bd6ff, 0xff4bb0, 0x4bffb0].forEach((c, k) => { const o = mk(new THREE.OctahedronGeometry(.45 + k % 2 * .3), c, .1); o.scale.y = 1.8; g.add(put(o, Math.cos(k * 1.6) * 1.2, 1.1, Math.sin(k * 1.6) * 1.2)); });
  if (i === 3) [[-1, 0], [.9, .5], [0, -1.1]].forEach(([x, z], k) => { building(g, x, z, .9, .7, 0xfff1d0); g.add(put(mk(new THREE.ConeGeometry(.8, .6, 4), [0xd94b3b, 0x3b7dd9, 0x3bd98a][k]), x, 1.45, z)); g.children.at(-1).rotation.y = Math.PI / 4; });
  if (i === 4) { building(g, -.8, 0, .9, 1.6, 0x8fb4ff); building(g, .4, .6, .8, 2.4, 0x6f8fe0); building(g, .6, -.8, 1, 1.2, 0xbcd0ff); }
  if (i === 5) { const o = mk(new THREE.CylinderGeometry(.5, .5, 1.4, 12), 0xd9a3ff, .2); g.add(put(o, 0, 1.1, 0)); g.add(put(mk(new THREE.SphereGeometry(.7, 16, 12), 0xffe27a, .2), 0, 2.2, 0)); tree(g, 1.4, .8, .8); }
  if (i === 6) { const r = mk(new THREE.TorusGeometry(1.3, .35, 10, 28), 0xd9b27a); r.rotation.x = Math.PI / 2; g.add(put(r, 0, .9, 0)); g.add(put(mk(new THREE.CylinderGeometry(1.1, 1.1, .2, 24), 0xf0d9a0), 0, .5, 0)); }
  if (i === 7) { building(g, 0, 0, 1.2, 3.4, 0x9fd3ff); g.add(put(mk(new THREE.SphereGeometry(.45, 12, 10), 0x38e1ff, .1), 0, 4.3, 0)); building(g, 1.2, .6, .7, 1.3, 0x6f8fe0); }
}
function label(txt, sub, locked) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const t = new THREE.CanvasTexture(c), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
  s.scale.set(5, 1.56, 1); s.renderOrder = 9;
  s.userData.draw = (lock, done) => {
    const x = c.getContext('2d'); x.clearRect(0, 0, 512, 160);
    x.fillStyle = lock ? '#2b2f55e6' : '#ff5fa2f0'; x.strokeStyle = done ? '#7dff9a' : '#ffc83d'; x.lineWidth = 8;
    x.beginPath(); x.roundRect(8, 8, 496, 144, 36); x.fill(); x.stroke();
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 44px Trebuchet MS,sans-serif'; x.fillText((lock ? '🔒 ' : done ? '✓ ' : '') + txt, 256, 70);
    x.font = 'bold 34px Trebuchet MS,sans-serif'; x.fillStyle = '#ffe27a'; x.fillText(sub, 256, 120); t.needsUpdate = true;
  };
  s.userData.draw(locked, false); return s;
}
function mascot() {
  const g = new THREE.Group();
  g.add(put(mk(new THREE.SphereGeometry(.45, 20, 16), 0xffc83d, .4), 0, .45, 0));
  g.add(put(mk(new THREE.SphereGeometry(.38, 20, 16), 0xffe08a, .4), 0, 1.15, 0));
  [-.14, .14].forEach(x => { g.add(put(mk(new THREE.SphereGeometry(.07, 8, 8), 0x111111), x, 1.22, .33)); });
  g.add(put(mk(new THREE.ConeGeometry(.32, .45, 16), 0xff5fa2), 0, 1.7, 0));
  return g;
}
export function initScene(canvas, worlds, onPick) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true });
  r.shadowMap.enabled = true;
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0a1040); sc.fog = new THREE.Fog(0x0a1040, 35, 80);
  const cam = new THREE.PerspectiveCamera(50, 1, .1, 200);
  sc.add(new THREE.HemisphereLight(0xbfd8ff, 0x223366, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(8, 20, 10); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22 }); sun.shadow.mapSize.set(1024, 1024); sc.add(sun);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), new THREE.MeshStandardMaterial({ color: 0x0b5fb0, roughness: .25, metalness: .3 }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -4.5; sea.receiveShadow = true; sc.add(sea);
  const sp = []; for (let i = 0; i < 700; i++) sp.push((Math.random() - .5) * 160, Math.random() * 50 + 5, (Math.random() - .5) * 160 - 20);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  sc.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: .25, fog: false })));
  const isl = [];
  worlds.forEach((w, i) => {
    const g = new THREE.Group(); g.userData.wid = w.id; g.position.set(POS[i][0], 0, POS[i][1]);
    g.add(mk(new THREE.CylinderGeometry(2.4, 2.6, .8, 28), GRASS[i], .8));
    g.add(put(mk(new THREE.ConeGeometry(2.6, 3.6, 24), 0x6b5a4a, 1), 0, -2.2, 0)).children.at(-1).rotation.x = Math.PI;
    decorate(g, i);
    const lb = label(w.name, `Mundo ${w.id} · ${w.lvl}`, true); lb.position.set(0, 5.6, 0); g.add(lb); g.userData.lb = lb;
    sc.add(g); isl.push(g);
  });
  for (let i = 0; i < 7; i++) { const a = POS[i], b = POS[i + 1];
    for (let k = 1; k < 6; k++) { const t = k / 6, s = mk(new THREE.CylinderGeometry(.32, .36, .25, 10), 0xe8c987); s.position.set(a[0] + (b[0] - a[0]) * t, -.1, a[1] + (b[1] - a[1]) * t); sc.add(s); } }
  const hero = mascot(); sc.add(hero);
  let cur = 0, unlocked = [true], done = [], t = 0, mx = 0, my = 0, down = null;
  const ray = new THREE.Raycaster(), v = new THREE.Vector2();
  function resize() {
    const w = innerWidth, h = innerHeight; r.setPixelRatio(Math.min(devicePixelRatio, canvas.dataset.q === 'low' ? 1 : 2)); r.setSize(w, h, false);
    cam.aspect = w / h; const d = Math.max(24, 15 / (Math.tan(25 * Math.PI / 180) * cam.aspect)); cam.userData = { d }; cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return; down = null;
    v.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(v, cam);
    const hit = ray.intersectObjects(isl, true)[0]; if (!hit) return;
    let o = hit.object; while (o && !o.userData.wid) o = o.parent; if (o) onPick(o.userData.wid);
  });
  const gray = new THREE.Color(0x555a80);
  function setState(unl, current, dn) {
    unlocked = unl; cur = current; done = dn;
    isl.forEach((g, i) => { g.traverse(o => { if (o.isMesh) o.material.color.copy(o.userData.c).lerp(gray, unl[i] ? 0 : .75); }); g.userData.lb.userData.draw(!unl[i], dn[i]); });
  }
  (function loop() {
    t += .016; const d = cam.userData.d;
    cam.position.set(mx * 4, d * .72 + 1, d * .62 + 3 + Math.sin(t * .3)); cam.lookAt(mx * 2, 0, 1.5 + my * 2);
    isl.forEach((g, i) => { g.position.y = Math.sin(t * 1.2 + i) * .25; });
    hero.position.set(POS[cur][0], isl[cur].position.y + 1.1 + Math.abs(Math.sin(t * 3)) * .4, POS[cur][1] + 1); hero.rotation.y = Math.sin(t) * .6;
    sea.material.color.setHSL(.58, .85, .33 + Math.sin(t) * .02);
    r.render(sc, cam); requestAnimationFrame(loop);
  })();
  return { setState, setQuality(q) { canvas.dataset.q = q; resize(); } };
}
