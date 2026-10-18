/* オフライン対応：主要ファイルをキャッシュ（https または localhost で有効） */
const C="joshi-v2",F=["./","index.html","css/style.css","js/data.js","js/novels.js","js/engine.js","js/harem.js","js/boss.js","js/phone.js","js/ogkai.js","js/game.js","icons/icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
