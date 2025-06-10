/**
 * ===================================
 * TEST HORS LIGNE - LSU V2
 * offline-test.js
 * ===================================
 */

class OfflineTester {
    constructor() {
        this.results = {
            serviceWorker: false,
            cache: false,
            offlinePage: false,
            localStorage: false,
            indexedDB: false
        };
    }

    async runTests() {
        console.log('🧪 Démarrage des tests hors ligne...');

        // Test du Service Worker
        await this.testServiceWorker();
        
        // Test du cache
        await this.testCache();
        
        // Test de la page hors ligne
        await this.testOfflinePage();
        
        // Test du localStorage
        await this.testLocalStorage();
        
        // Test d'IndexedDB
        await this.testIndexedDB();

        // Afficher les résultats
        this.displayResults();
    }

    async testServiceWorker() {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                this.results.serviceWorker = !!registration;
                console.log('✅ Service Worker:', this.results.serviceWorker);
            }
        } catch (error) {
            console.error('❌ Erreur Service Worker:', error);
        }
    }

    async testCache() {
        try {
            const cache = await caches.open('lsu-v2-cache-v1');
            const requests = await cache.keys();
            this.results.cache = requests.length > 0;
            console.log('✅ Cache:', this.results.cache);
        } catch (error) {
            console.error('❌ Erreur Cache:', error);
        }
    }

    async testOfflinePage() {
        try {
            const response = await fetch('/offline.html');
            this.results.offlinePage = response.ok;
            console.log('✅ Page hors ligne:', this.results.offlinePage);
        } catch (error) {
            console.error('❌ Erreur page hors ligne:', error);
        }
    }

    async testLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            const value = localStorage.getItem('test');
            localStorage.removeItem('test');
            this.results.localStorage = value === 'test';
            console.log('✅ LocalStorage:', this.results.localStorage);
        } catch (error) {
            console.error('❌ Erreur LocalStorage:', error);
        }
    }

    async testIndexedDB() {
        try {
            const db = await this.openTestDB();
            this.results.indexedDB = !!db;
            console.log('✅ IndexedDB:', this.results.indexedDB);
        } catch (error) {
            console.error('❌ Erreur IndexedDB:', error);
        }
    }

    openTestDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('lsu-test-db', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                db.close();
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore('test-store');
            };
        });
    }

    displayResults() {
        console.log('\n📊 Résultats des tests hors ligne:');
        console.log('--------------------------------');
        
        for (const [test, result] of Object.entries(this.results)) {
            console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'OK' : 'ÉCHEC'}`);
        }

        const allPassed = Object.values(this.results).every(result => result);
        console.log('\n' + (allPassed ? '✨ Tous les tests sont passés !' : '⚠️ Certains tests ont échoué.'));
    }
}

// Exécuter les tests
const tester = new OfflineTester();
tester.runTests(); 