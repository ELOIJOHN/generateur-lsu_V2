/**
 * ===================================
 * ERROR HANDLER SERVICE
 * js/error-handler.js
 * ===================================
 * 
 * Service de gestion des erreurs
 * - Gestion centralisée
 * - Logging intelligent
 * - Notifications utilisateur
 * - Récupération automatique
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.notificationContainer = null;
        this.initializeErrorHandling();
    }

    /**
     * Initialise la gestion des erreurs
     */
    initializeErrorHandling() {
        // Gestionnaire d'erreurs global
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(error || new Error(message), {
                source,
                lineno,
                colno
            });
            return true;
        };

        // Gestionnaire de promesses non gérées
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'unhandledrejection'
            });
        });

        // Création du conteneur de notifications
        this.createNotificationContainer();
    }

    /**
     * Gère une erreur
     */
    handleError(error, context = {}) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context
        };

        // Ajouter à l'historique
        this.errors.unshift(errorInfo);
        if (this.errors.length > this.maxErrors) {
            this.errors.pop();
        }

        // Logger l'erreur
        console.error('[Error]', errorInfo);

        // Afficher la notification
        this.showErrorNotification(error);

        // Tenter la récupération automatique
        this.attemptRecovery(error, context);
    }

    /**
     * Affiche une notification d'erreur
     */
    showErrorNotification(error) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-header">
                <span>⚠️ Erreur</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="error-message">${error.message}</div>
        `;

        this.notificationContainer.appendChild(notification);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Crée le conteneur de notifications
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'error-notifications';
        document.body.appendChild(this.notificationContainer);
    }

    /**
     * Tente une récupération automatique
     */
    attemptRecovery(error, context) {
        // Récupération spécifique selon le type d'erreur
        if (error.name === 'NetworkError') {
            this.handleNetworkError(error);
        } else if (error.name === 'StorageError') {
            this.handleStorageError(error);
        } else if (error.name === 'OllamaError') {
            this.handleOllamaError(error);
        }
    }

    /**
     * Gère les erreurs réseau
     */
    handleNetworkError(error) {
        // Vérifier la connexion
        if (!navigator.onLine) {
            this.showOfflineNotification();
        } else {
            // Tenter une reconnexion
            this.attemptReconnection();
        }
    }

    /**
     * Gère les erreurs de stockage
     */
    handleStorageError(error) {
        // Nettoyer le cache si nécessaire
        if (error.message.includes('QuotaExceededError')) {
            this.clearStorage();
        }
    }

    /**
     * Gère les erreurs Ollama
     */
    handleOllamaError(error) {
        // Vérifier la connexion Ollama
        this.checkOllamaConnection();
    }

    /**
     * Affiche une notification hors ligne
     */
    showOfflineNotification() {
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="offline-header">
                <span>📡 Hors ligne</span>
            </div>
            <div class="offline-message">Vérifiez votre connexion internet</div>
        `;

        this.notificationContainer.appendChild(notification);
    }

    /**
     * Tente une reconnexion
     */
    async attemptReconnection() {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch('/api/health');
                if (response.ok) {
                    this.showReconnectedNotification();
                    return true;
                }
            } catch (error) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }

        return false;
    }

    /**
     * Affiche une notification de reconnexion
     */
    showReconnectedNotification() {
        const notification = document.createElement('div');
        notification.className = 'reconnected-notification';
        notification.innerHTML = `
            <div class="reconnected-header">
                <span>✅ Reconnecté</span>
            </div>
            <div class="reconnected-message">La connexion est rétablie</div>
        `;

        this.notificationContainer.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    /**
     * Nettoie le stockage
     */
    clearStorage() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('Storage cleared successfully');
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    /**
     * Vérifie la connexion Ollama
     */
    async checkOllamaConnection() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (!response.ok) {
                throw new Error('Ollama service unavailable');
            }
        } catch (error) {
            this.showOllamaErrorNotification();
        }
    }

    /**
     * Affiche une notification d'erreur Ollama
     */
    showOllamaErrorNotification() {
        const notification = document.createElement('div');
        notification.className = 'ollama-error-notification';
        notification.innerHTML = `
            <div class="ollama-error-header">
                <span>🤖 Ollama indisponible</span>
            </div>
            <div class="ollama-error-message">Vérifiez que le service Ollama est en cours d'exécution</div>
        `;

        this.notificationContainer.appendChild(notification);
    }

    /**
     * Obtient l'historique des erreurs
     */
    getErrorHistory() {
        return this.errors;
    }

    /**
     * Efface l'historique des erreurs
     */
    clearErrorHistory() {
        this.errors = [];
    }
}

// Exporter le gestionnaire d'erreurs
export default ErrorHandler; 