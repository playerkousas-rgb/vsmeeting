var CACHE = "scout-v44-minigame-20260917";
var ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./css/app.css",
  "./js/data.js", "./js/teach.js", "./js/teach2.js", "./js/interests.js", "./js/ceremony.js", "./js/uniform.js", "./js/dia.js", "./js/ayp.js",
  "./js/figs.js", "./js/projector.js", "./js/minigame.js", "./js/items.js",
  
  
  "./img/fig/game-banner.avif",
  "./img/fig/game-ball.avif", "./img/fig/game-shape.avif", "./img/fig/game-tarp.avif",
  "./img/fig/game-pack.avif", "./img/fig/game-relay-cards.avif", "./img/fig/game-tug.avif",
  "./img/fig/game-aid.avif", "./img/fig/game-orienteer.avif",
  "./img/fig/game-beachflag.avif", "./img/fig/game-water.avif", "./img/fig/game-chairs.avif",
  "./img/fig/skill-ropecare.avif", "./img/fig/skill-legend.avif", "./img/fig/skill-tent.avif",
  "./img/fig/skill-stove.avif", "./img/fig/skill-rice.avif", "./img/fig/skill-lost.avif",
  "./img/fig/game-lineup.avif",
  "./img/fig/skill-knife.avif", "./img/fig/skill-sos.avif",
  "./img/fig/skill-pack.avif",
  "./img/fig/aid-nosebleed.avif", "./img/fig/aid-cramp.avif", "./img/fig/aid-burn.avif", "./img/fig/aid-cut.avif", "./img/fig/aid-sting.avif",
  "./js/c01-lesson.js", "./js/c02-lesson.js", "./js/c03-lesson.js", "./js/c04-lesson.js", "./js/c05-lesson.js", "./js/c06-lesson.js", "./js/c07-lesson.js", "./js/c08-lesson.js", "./js/c09-lesson.js", "./js/c10-lesson.js", "./js/c11-lesson.js", "./js/c12-lesson.js", "./js/c13-lesson.js", "./js/c14-lesson.js", "./js/c15-lesson.js", "./js/c16-lesson.js", "./js/app.js",
  "./img/dia/cer-close.avif",
  "./img/dia/cer-flag.avif",
  "./img/dia/cer-formup.avif",
  "./img/dia/cer-oath.avif",
  "./img/dia/cer-open.avif",
  "./img/dia/dgm-compass.avif",
  "./img/dia/dgm-pack.avif",
  "./img/dia/fire-circle.avif",
  "./img/dia/fire-flow.avif",
  "./img/dia/fire-scarf.avif",
  "./img/dia/game-aid-station.avif",
  "./img/dia/game-beach-flag.avif",
  "./img/dia/game-carpet.avif",
  "./img/dia/game-chairs-circle.avif",
  "./img/dia/game-hunt.avif",
  "./img/dia/game-hush.avif",
  "./img/dia/game-knot-relay.avif",
  "./img/dia/game-log-pull.avif",
  "./img/dia/game-names.avif",
  "./img/dia/game-pack-run.avif",
  "./img/dia/game-rope-line.avif",
  "./img/dia/game-water-relay.avif",
  "./img/dia/skill-faint.avif",
  "./img/dia/skill-knife.avif",
  "./img/dia/skill-legend.avif",
  "./img/dia/skill-lost.avif",
  "./img/dia/skill-rice.avif",
  "./img/dia/skill-ropecare.avif",
  "./img/dia/skill-sos.avif",
  "./img/dia/skill-stove.avif",
  "./img/dia/skill-tent.avif",
  "./icons/icon-192.avif", "./icons/icon-192.png", "./icons/icon-512.avif", "./icons/icon-512.png", "./icons/icon-maskable-512.png"
];
var EXTERNAL_PREFIX = "https://";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* 逐個 add：其中一張圖 missing 都唔好拖冧晒核心檔案嘅預緩存 */
      return Promise.all(ASSETS.map(function (a) {
        return c.add(a).catch(function(){ return Promise.resolve(); });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      var net = fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { try { c.put(req, copy); } catch (_) {} });
        return res;
      }).catch(function(){ return cached || caches.match("./index.html"); });
      return cached || net;
    })
  );
});
