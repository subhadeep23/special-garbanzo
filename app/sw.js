const CACHE = 'garbanzo-shell:' + new URL(self.registration.scope).pathname + ':' + "d56f5c399e475151363fc9628d8777c29abe6588cc13d40b96f898ea6a22d13b";
const FILES = ["index.html","assets/index-BReYk-OU.js","assets/practice-jpH_h4yj.js","assets/KaTeX_AMS-Regular-BQhdFMY1.woff2","assets/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2","assets/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2","assets/KaTeX_Fraktur-Bold-CL6g_b3V.woff2","assets/KaTeX_Fraktur-Regular-CTYiF6lA.woff2","assets/KaTeX_Main-Bold-Cx986IdX.woff2","assets/KaTeX_Main-BoldItalic-DxDJ3AOS.woff2","assets/KaTeX_Main-Italic-NWA7e6Wa.woff2","assets/KaTeX_Main-Regular-B22Nviop.woff2","assets/KaTeX_Math-BoldItalic-CZnvNsCZ.woff2","assets/KaTeX_Math-Italic-t53AETM-.woff2","assets/KaTeX_SansSerif-Bold-D1sUS0GD.woff2","assets/KaTeX_SansSerif-Italic-C3H0VqGB.woff2","assets/KaTeX_SansSerif-Regular-DDBCnlJ7.woff2","assets/KaTeX_Script-Regular-D3wIWfF6.woff2","assets/KaTeX_Size1-Regular-mCD8mA8B.woff2","assets/KaTeX_Size2-Regular-Dy4dx90m.woff2","assets/KaTeX_Size4-Regular-Dl5lxZxV.woff2","assets/KaTeX_Typewriter-Regular-CO6r4hn1.woff2","assets/index-6UyrXLue.css","assets/practice-BCJ9iZHA.css","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png","icon-maskable-512.png"].map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => event.waitUntil((async () => {
  try { await (await caches.open(CACHE)).addAll(FILES); }
  catch (error) { await caches.delete(CACHE); throw error; }
})()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
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