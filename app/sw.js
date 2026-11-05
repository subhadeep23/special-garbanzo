const CACHE = 'garbanzo-shell:' + new URL(self.registration.scope).pathname + ':' + "094de28a014374fba74a20b6aa0cc2b16c81e682895990aa6fb9418f150ddd86";
const FILES = ["index.html","assets/index-DumG_22-.js","assets/practice-F02vGRGW.js","assets/KaTeX_AMS-Regular-BQhdFMY1.woff2","assets/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2","assets/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2","assets/KaTeX_Fraktur-Bold-CL6g_b3V.woff2","assets/KaTeX_Fraktur-Regular-CTYiF6lA.woff2","assets/KaTeX_Main-Bold-Cx986IdX.woff2","assets/KaTeX_Main-BoldItalic-DxDJ3AOS.woff2","assets/KaTeX_Main-Italic-NWA7e6Wa.woff2","assets/KaTeX_Main-Regular-B22Nviop.woff2","assets/KaTeX_Math-BoldItalic-CZnvNsCZ.woff2","assets/KaTeX_Math-Italic-t53AETM-.woff2","assets/KaTeX_SansSerif-Bold-D1sUS0GD.woff2","assets/KaTeX_SansSerif-Italic-C3H0VqGB.woff2","assets/KaTeX_SansSerif-Regular-DDBCnlJ7.woff2","assets/KaTeX_Script-Regular-D3wIWfF6.woff2","assets/KaTeX_Size1-Regular-mCD8mA8B.woff2","assets/KaTeX_Size2-Regular-Dy4dx90m.woff2","assets/KaTeX_Size4-Regular-Dl5lxZxV.woff2","assets/KaTeX_Typewriter-Regular-CO6r4hn1.woff2","assets/index-Ddrv9jFl.css","assets/part-01-fABdxDnL.bin","assets/part-02-Bv4yEHJ8.bin","assets/part-03-D10O3hWJ.bin","assets/part-04-C8K1KwaG.bin","assets/part-05-ClSsPWci.bin","assets/part-06-B4BV7ny3.bin","assets/part-07-BMh7a5ll.bin","assets/part-08-2Wy8OqfY.bin","assets/part-09-Ar9MXm2x.bin","assets/part-10-JJAxGDW3.bin","assets/part-11-3B5JsjMs.bin","assets/part-12-B5tWLuBu.bin","assets/part-13-DXC7aIts.bin","assets/part-14-DTwFAEp8.bin","assets/part-15-DBifMof3.bin","assets/part-16-CPif_5Hq.bin","assets/practice-BCJ9iZHA.css","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png","icon-maskable-512.png"].map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => event.waitUntil((async () => {
  // cache: 'reload' skips the browser's HTTP cache. Pages serves index.html with max-age=600, so a plain addAll
  // could store the previous release's index.html in the new cache (U02 failed this way; see evals/update.spec.ts).
  try { await (await caches.open(CACHE)).addAll(FILES.map(url => new Request(url, { cache: 'reload' }))); }
  catch (error) { await caches.delete(CACHE); throw error; }
})()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  // Sent only by the "Update now" bar (src/update.ts), after it has checked that no progress is unsaved.
  if (event.data?.kind === 'skip-waiting') { event.waitUntil(self.skipWaiting()); return; }
  if (event.data?.kind !== 'shell-status' || !event.ports[0]) return;
  event.waitUntil((async () => {
    const exists = await caches.has(CACHE);
    const cache = exists ? await caches.open(CACHE) : undefined;
    const complete = cache && (await Promise.all(FILES.map(url => cache.match(url)))).every(Boolean);
    event.ports[0].postMessage(Boolean(complete));
  })().catch(() => event.ports[0].postMessage(false)));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => (await (await caches.open(CACHE)).match(FILES[0], { ignoreVary: true })) || fetch(event.request))());
  } else if (FILES.includes(url.href)) {
    event.respondWith((async () => (await (await caches.open(CACHE)).match(event.request, { ignoreVary: true })) || fetch(event.request))());
  }
});