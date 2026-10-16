/* オフライン対応：主要ファイルをキャッシュ（https または localhost で有効） */
const C="joshi-v1",F=["./","index.html","css/style.css","js/data.js","js/save.js","js/audio.js","js/art.js","js/novel.js","js/game.js","icons/icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
