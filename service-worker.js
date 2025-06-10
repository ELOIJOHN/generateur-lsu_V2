const CACHE_NAME = 'lsu-v2-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/dashboard.css',
  '/css/components.css',
  '/css/responsive.css',
  '/js/ollama-enhanced.js',
  '/js/smart-templates.js',
  '/js/pdf-generator.js',
  '/js/error-handler.js',
  '/js/utils.js',
  '/data/templates.json',
  '/data/config.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 