const KEY = 'ew3d_save_v1';
const def = () => ({
  name: 'Player', started: false, xp: 0, coins: 0, streak: 0, lastDay: '', time: 0,
  done: {}, words: {}, skills: { read: [0, 0], write: [0, 0], listen: [0, 0], grammar: [0, 0], speak: [0, 0], talk: [0, 0] },
  settings: { vol: 0.8, music: false, fx: true, rate: 0.9, subs: true, quality: 'high', big: false }
});
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) return Object.assign(def(), d, { settings: Object.assign(def().settings, d.settings) }); } catch (e) {}
  return def();
}
export const S = load();
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
export const resetAll = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
export function touchStreak() {
  const today = new Date().toDateString();
  if (S.lastDay === today) return;
  const y = new Date(Date.now() - 864e5).toDateString();
  S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = today; save();
}
