// Offline-Speicher für MiniWelt: nach dem ersten Laden läuft das Spiel auch ohne Internet.
// Bei jeder neuen Version VERSION erhöhen (macht scripts/copy-standalone.mjs automatisch).
const VERSION = 'miniwelt-202611150821';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  // Spiel + alle Sprachdateien vorab speichern, damit die Stimmen auch offline klingen
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES).then(() =>
    fetch('voices/manifest.json').then((r) => (r.ok ? r.json() : [])).then((l) => c.addAll(l.map((f) => 'voices/' + f))).catch(() => {}))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Erst das Netz fragen (für Updates), bei Funkloch den Speicher nehmen.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
