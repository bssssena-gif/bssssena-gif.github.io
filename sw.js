const CACHE_NAME = "docnear-v16";
const STATIC_ASSETS = [
  "./index.html",
  "./DocNear.css",
  "./DocNear.js",
  "./admin.html",
  "./manifest.json"
];

/* ── Install ── */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(()=>{}))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: delete old caches ── */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: Network First strategy ── */
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  /* Supabase API → always network */
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  /* External (Fonts, Razorpay) → network with cache fallback */
  if (url.hostname.includes("fonts.g") ||
      url.hostname.includes("checkout.razorpay") ||
      url.hostname.includes("fonts.gstatic")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request)
      )
    );
    return;
  }

  /* App files → Network First, cache fallback */
  event.respondWith(
    fetch(event.request).then(res => {
      if (res.ok && event.request.method === "GET") {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      }
      return res;
    }).catch(() =>
      caches.match(event.request).then(cached =>
        cached || new Response("<h2>DocNear — Offline</h2><p>Please check your connection.</p>",
          { headers: { "Content-Type": "text/html" } })
      )
    )
  );
});
