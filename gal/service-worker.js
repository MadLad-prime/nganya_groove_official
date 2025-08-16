const CACHE_NAME = 'nganya-groove-v1';
const urlsToCache = [
  '/',
  '/gal/index.html',
  '/gal/home.css',
  '/gal/images/blog/detroit.jpg',
  '/gal/images/blog/baba_yaga.jpg',
  '/gal/images/blog/x-trail.jpg',
  '/gal/images/ab.jpg',
  '/gal/favicon.jpg',
  '/gal/manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
