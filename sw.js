/**
 * ===================================
 * SERVICE WORKER - LSU V2
 * sw.js
 * ===================================
 */

const CACHE_NAME = 'lsu-v2-cache-v1';
const OFFLINE_URL = '/offline.html';

// Ressources à mettre en cache
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/students.html',
    '/css/style.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/ollama-enhanced.js',
    '/js/smart-templates.js',
    '/js/error-handler.js',
    '/js/utils.js',
    '/js/tests.js',
    '/data/templates.json',
    '/data/config.json',
    '/manifest.json',
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('Ressources mises en cache');
                return self.skipWaiting();
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activé');
            return self.clients.claim();
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes vers l'API Ollama
    if (event.request.url.includes('localhost:11434')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Vérifier si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloner la réponse
                        const responseToCache = response.clone();

                        // Mettre en cache la nouvelle ressource
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // En cas d'erreur, retourner la page hors ligne
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Gestion des messages
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Voir les détails',
                icon: '/assets/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: '/assets/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Générateur LSU', options)
    );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-comments') {
        event.waitUntil(syncComments());
    }
});

// Fonction de synchronisation des commentaires
async function syncComments() {
    try {
        const db = await openDB();
        const comments = await db.getAll('pendingComments');
        
        for (const comment of comments) {
            try {
                await fetch('/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(comment)
                });
                
                await db.delete('pendingComments', comment.id);
            } catch (error) {
                console.error('Erreur de synchronisation:', error);
            }
        }
    } catch (error) {
        console.error('Erreur d\'accès à la base de données:', error);
    }
}

// Fonction d'ouverture de la base de données IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('lsu-db', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('pendingComments', { keyPath: 'id' });
        };
    });
} 