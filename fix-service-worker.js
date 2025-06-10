console.log('🔧 Diagnostic et correction du Service Worker...');

const fs = require('fs');
const path = require('path');

const swFiles = ['sw.js', 'service-worker.js'];
let swFile = null;

for (const file of swFiles) {
    if (fs.existsSync(path.join(__dirname, file))) {
        swFile = file;
        break;
    }
}

if (!swFile) {
    console.log('❌ Aucun Service Worker trouvé, création d\'un nouveau...');
    const serviceWorkerContent = `// Service Worker LSU V2 - Version optimisée
const CACHE_NAME = 'lsu-v2-cache-v1.0.0';
const OFFLINE_URL = '/offline.html';
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/dashboard.html', 
    '/students.html',
    '/offline.html',
    '/css/style.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/ollama-enhanced.js',
    '/js/smart-templates.js',
    '/js/error-handler.js',
    '/js/utils.js',
    '/manifest.json'
];
self.addEventListener('install', event => {
    console.log('[SW] Installation en cours...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Mise en cache des ressources statiques');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('[SW] Installation terminée');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Erreur installation:', error);
            })
    );
});
self.addEventListener('activate', event => {
    console.log('[SW] Activation en cours...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Activation terminée');
                return self.clients.claim();
            })
    );
});
self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') {
        return;
    }
    if (request.url.includes('localhost:11434')) {
        return;
    }
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, responseClone);
                        });
                }
                return response;
            })
            .catch(error => {
                console.log('[SW] Réseau indisponible, recherche en cache:', request.url);
                return caches.match(request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                        throw error;
                    });
            })
    );
});
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            cached: STATIC_RESOURCES.length
        });
    }
});
self.addEventListener('updatefound', () => {
    console.log('[SW] Mise à jour trouvée');
});
console.log('[SW] Service Worker LSU V2 chargé');`;
    fs.writeFileSync(path.join(__dirname, 'sw.js'), serviceWorkerContent);
    swFile = 'sw.js';
    console.log('✅ Service Worker créé : sw.js');
} else {
    console.log(`✅ Service Worker trouvé : ${swFile}`);
}

const swRegistrationScript = `// sw-register.js - Enregistrement optimisé du Service Worker
(function() {
    'use strict';
    if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker non supporté par ce navigateur');
        return;
    }
    window.addEventListener('load', function() {
        registerServiceWorker();
    });
    async function registerServiceWorker() {
        try {
            console.log('🔧 Enregistrement du Service Worker...');
            const registration = await navigator.serviceWorker.register('/${swFile}', {
                scope: '/'
            });
            console.log('✅ Service Worker enregistré:', registration.scope);
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Mise à jour du Service Worker détectée');
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('✨ Nouvelle version disponible');
                        showUpdateNotification();
                    }
                });
            });
            if (registration.active) {
                console.log('✅ Service Worker déjà actif');
            }
            if (registration.waiting) {
                console.log('🔄 Activation du Service Worker en attente...');
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            return registration;
        } catch (error) {
            console.error('❌ Erreur enregistrement Service Worker:', error);
            if (error.name === 'SecurityError') {
                console.error('🚫 Erreur de sécurité - vérifiez que vous utilisez HTTPS ou localhost');
            } else if (error.name === 'TypeError') {
                console.error('🚫 Fichier Service Worker introuvable - vérifiez le chemin');
            }
            return null;
        }
    }
    function showUpdateNotification() {
        if (window.showToast) {
            window.showToast('Nouvelle version disponible ! Rechargez la page.', 'info', 5000);
        } else {
            console.log('💡 Nouvelle version disponible - rechargez la page');
        }
    }
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker contrôleur changé');
        if (window.confirm('Une nouvelle version est disponible. Recharger maintenant ?')) {
            window.location.reload();
        }
    });
    navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log(`ℹ️ ${registrations.length} Service Worker(s) enregistré(s)`);
        registrations.forEach((reg, index) => {
            console.log(`   ${index + 1}. Scope: ${reg.scope}`);
        });
    });
})();`;

fs.writeFileSync(path.join(__dirname, 'sw-register.js'), swRegistrationScript);
console.log('✅ Script d\'enregistrement créé : sw-register.js');

const htmlUpdateInstructions = `\n📝 MISE À JOUR DES PAGES HTML REQUISE\n\nAjoutez ces lignes dans le <head> de vos pages HTML :\n\n<!-- Service Worker Registration -->\n<script src="/sw-register.js"></script>\n\nOU directement dans vos pages, avant la fermeture </body> :\n\n<script>\n${swRegistrationScript}\n</script>\n\n📋 Pages à mettre à jour :\n   - index.html\n   - dashboard.html  \n   - students.html\n   - tests/validation.html\n\n🔧 Exemple d'intégration dans index.html :\n\n<!DOCTYPE html>\n<html lang="fr">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Générateur LSU V2</title>\n    <link rel="manifest" href="/manifest.json">\n    <link rel="icon" href="/favicon.ico">\n    <!-- ... autres CSS ... -->\n</head>\n<body>\n    <!-- ... contenu de la page ... -->\n    \n    <!-- Scripts -->\n    <script src="/js/utils.js"></script>\n    <script src="/js/ollama-enhanced.js"></script>\n    <script src="/sw-register.js"></script>\n</body>\n</html>\n`;

console.log(htmlUpdateInstructions);

const swTesterHTML = `<!DOCTYPE html>\n<html lang="fr">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Testeur Service Worker</title>\n    <style>\n        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }\n        .status { padding: 15px; margin: 10px 0; border-radius: 8px; }\n        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }\n        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }\n        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }\n        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }\n        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }\n        button:hover { background: #0056b3; }\n        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }\n    </style>\n</head>\n<body>\n    <h1>🔧 Testeur Service Worker LSU V2</h1>\n    <div id="results"></div>\n    \n    <button onclick="testServiceWorker()">🧪 Tester Service Worker</button>\n    <button onclick="testCache()">💾 Tester Cache</button>\n    <button onclick="testOffline()">📱 Tester Mode Offline</button>\n    <button onclick="clearCache()">🗑️ Vider Cache</button>\n    \n    <script src="/sw-register.js"></script>\n    <script>\n        const results = document.getElementById('results');\n        \n        function addResult(message, type = 'info') {\n            const div = document.createElement('div');\n            div.className = `status ${type}`;\n            div.innerHTML = message;\n            results.appendChild(div);\n        }\n        \n        async function testServiceWorker() {\n            addResult('🔧 Test du Service Worker...', 'info');\n            \n            if (!('serviceWorker' in navigator)) {\n                addResult('❌ Service Worker non supporté', 'error');\n                return;\n            }\n            \n            try {\n                const registrations = await navigator.serviceWorker.getRegistrations();\n                \n                if (registrations.length === 0) {\n                    addResult('⚠️ Aucun Service Worker enregistré', 'warning');\n                    return;\n                }\n                \n                addResult(`✅ ${registrations.length} Service Worker(s) trouvé(s)`, 'success');\n                \n                registrations.forEach((reg, index) => {\n                    let status = 'Inconnu';\n                    if (reg.active) status = 'Actif';\n                    else if (reg.installing) status = 'Installation';\n                    else if (reg.waiting) status = 'En attente';\n                    \n                    addResult(`   📋 SW ${index + 1}: ${status} (Scope: ${reg.scope})`, 'info');\n                });\n                \n            } catch (error) {\n                addResult(`❌ Erreur test SW: ${error.message}`, 'error');\n            }\n        }\n        \n        async function testCache() {\n            addResult('💾 Test du Cache...', 'info');\n            \n            if (!('caches' in window)) {\n                addResult('❌ Cache API non supporté', 'error');\n                return;\n            }\n            \n            try {\n                const cacheNames = await caches.keys();\n                \n                if (cacheNames.length === 0) {\n                    addResult('⚠️ Aucun cache trouvé', 'warning');\n                    return;\n                }\n                \n                addResult(`✅ ${cacheNames.length} cache(s) trouvé(s)`, 'success');\n                \n                for (const cacheName of cacheNames) {\n                    const cache = await caches.open(cacheName);\n                    const keys = await cache.keys();\n                    addResult(`   📦 ${cacheName}: ${keys.length} ressources`, 'info');\n                }\n                \n            } catch (error) {\n                addResult(`❌ Erreur test cache: ${error.message}`, 'error');\n            }\n        }\n        \n        function testOffline() {\n            addResult('📱 Test Mode Offline...', 'info');\n            \n            if (navigator.onLine) {\n                addResult('ℹ️ Actuellement en ligne - simulez une déconnexion pour tester', 'info');\n            } else {\n                addResult('✅ Mode hors ligne détecté', 'success');\n            }\n            \n            fetch('/offline.html')\n                .then(response => {\n                    if (response.ok) {\n                        addResult('✅ Page offline.html accessible', 'success');\n                    } else {\n                        addResult('❌ Page offline.html introuvable', 'error');\n                    }\n                })\n                .catch(error => {\n                    addResult(`⚠️ Test offline: ${error.message}`, 'warning');\n                });\n        }\n        \n        async function clearCache() {\n            addResult('🗑️ Suppression du cache...', 'info');\n            \n            try {\n                const cacheNames = await caches.keys();\n                await Promise.all(cacheNames.map(name => caches.delete(name)));\n                addResult(`✅ ${cacheNames.length} cache(s) supprimé(s)`, 'success');\n                const registrations = await navigator.serviceWorker.getRegistrations();\n                await Promise.all(registrations.map(reg => reg.unregister()));\n                addResult(`✅ ${registrations.length} Service Worker(s) désenregistré(s)`, 'success');\n                addResult('🔄 Rechargez la page pour réinitialiser', 'info');\n            } catch (error) {\n                addResult(`❌ Erreur suppression: ${error.message}`, 'error');\n            }\n        }\n        window.addEventListener('load', () => {\n            setTimeout(testServiceWorker, 2000);\n        });\n    </script>\n</body>\n</html>`;

fs.writeFileSync(path.join(__dirname, 'test-sw.html'), swTesterHTML);

console.log(`\n🎉 CORRECTION SERVICE WORKER TERMINÉE !\n\n📋 Fichiers créés/mis à jour :\n   ✅ ${swFile} - Service Worker optimisé\n   ✅ sw-register.js - Script d'enregistrement\n   ✅ test-sw.html - Testeur Service Worker\n\n🚀 Prochaines étapes :\n   1. Ajoutez <script src="/sw-register.js"></script> dans vos pages HTML\n   2. Ouvrez test-sw.html pour valider le fonctionnement\n   3. Testez avec Ctrl+F5 pour forcer le rechargement\n   4. Vérifiez dans DevTools > Application > Service Workers\n\n🔧 Diagnostic rapide :\n   - Ouvrez test-sw.html dans votre navigateur\n   - Cliquez sur "🧪 Tester Service Worker"\n   - Tous les tests doivent être verts ✅\n\n⚡ Alternative si problème persiste :\n   1. DevTools > Application > Storage > Clear Storage\n   2. Cochez tout et cliquez "Clear site data"\n   3. Rechargez avec Ctrl+F5\n`); 