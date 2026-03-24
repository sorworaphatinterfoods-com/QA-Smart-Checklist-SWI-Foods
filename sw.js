const CACHE_NAME = 'qa-audit-cache-v1';
const urlsToCache = [
  './',
  './audit_app.html',
  './manifest.json',
  './process_master.csv',
  './parameter_master.csv',
  './equipment_master.csv',
  './process_parameter_map.csv',
  './ccp_master.csv',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Stale-while-revalidate: return cache first, then update cache in background
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if(networkResponse && networkResponse.status === 200){
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(()=> null);
      return cached || fetchPromise;
    })
  );
});
