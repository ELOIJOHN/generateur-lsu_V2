/**
 * ===================================
 * OLLAMA SERVICE ENHANCED
 * js/ollama-enhanced.js
 * ===================================
 * 
 * Service robuste pour l'intégration avec Ollama
 * - Gestion d'erreurs avancée
 * - Retry automatique avec backoff
 * - Fallback vers templates prédéfinis
 * - Monitoring des performances
 * - Cache intelligent
 */

class OllamaService {
    constructor(config = {}) {
        this.config = {
            baseUrl: config.baseUrl || 'http://localhost:11434',
            model: config.model || 'mistral',
            timeout: config.timeout || 30000,
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 1000,
            cacheEnabled: config.cacheEnabled !== false,
            fallbackEnabled: config.fallbackEnabled !== false,
            ...config
        };
        
        this.cache = new Map();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            cacheHits: 0,
            fallbackUsed: 0
        };
        
        this.isOnline = false;
        this.lastChecked = null;
        this.checkInterval = null;
        
        // Initialiser la vérification de statut
        this.startStatusMonitoring();
    }

    /**
     * Génère un commentaire pour un élève
     * @param {Object} studentData - Données de l'élève
     * @param {Object} evaluationData - Données d'évaluation
     * @returns {Promise<Object>} Résultat avec commentaire et métadonnées
     */
    async generateComment(studentData, evaluationData) {
        const startTime = Date.now();
        this.stats.totalRequests++;
        
        try {
            // Vérifier le cache en premier
            if (this.config.cacheEnabled) {
                const cacheKey = this.generateCacheKey(studentData, evaluationData);
                const cached = this.cache.get(cacheKey);
                
                if (cached && this.isCacheValid(cached)) {
                    this.stats.cacheHits++;
                    return {
                        success: true,
                        comment: cached.comment,
                        source: 'cache',
                        responseTime: Date.now() - startTime,
                        metadata: cached.metadata
                    };
                }
            }
            
            // Construire le prompt intelligent
            const prompt = this.buildSmartPrompt(studentData, evaluationData);
            
            // Tenter la génération avec retry
            const result = await this.generateWithRetry(prompt, startTime);
            
            // Mettre en cache si succès
            if (result.success && this.config.cacheEnabled) {
                this.cacheResult(studentData, evaluationData, result);
            }
            
            this.stats.successfulRequests++;
            return result;
            
        } catch (error) {
            this.stats.failedRequests++;
            console.error('[Ollama] Erreur génération:', error);
            
            // Fallback si activé
            if (this.config.fallbackEnabled) {
                return this.getFallbackComment(studentData, evaluationData, startTime);
            }
            
            throw error;
        }
    }

    /**
     * Génère avec système de retry
     */
    async generateWithRetry(prompt, startTime) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                console.log(`[Ollama] Tentative ${attempt}/${this.config.retryAttempts}`);
                
                const result = await this.callOllamaAPI(prompt);
                
                return {
                    success: true,
                    comment: result.response,
                    source: 'ollama',
                    responseTime: Date.now() - startTime,
                    attempt: attempt,
                    metadata: {
                        model: this.config.model,
                        timestamp: new Date().toISOString(),
                        promptLength: prompt.length,
                        responseLength: result.response.length
                    }
                };
                
            } catch (error) {
                lastError = error;
                console.warn(`[Ollama] Tentative ${attempt} échouée:`, error.message);
                
                // Ne pas attendre après la dernière tentative
                if (attempt < this.config.retryAttempts) {
                    const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    await this.delay(delay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Appel direct à l'API Ollama
     */
    async callOllamaAPI(prompt) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(`${this.config.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 200
                    }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.response) {
                throw new Error('Réponse vide de Ollama');
            }
            
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Timeout de connexion à Ollama');
            }
            
            throw error;
        }
    }

    /**
     * Construit un prompt intelligent et contextualisé
     */
    buildSmartPrompt(student, evaluation) {
        const context = this.getEducationalContext(student.niveau, evaluation.matiere);
        const tone = this.getToneFromEvaluation(evaluation);
        
        return `Tu es un enseignant expérimenté du primaire en France. Rédige un commentaire personnalisé pour le livret scolaire.

CONTEXTE ÉLÈVE :
- Prénom : ${student.prenom}
- Nom : ${student.nom}
- Niveau : ${student.niveau}
- Classe : ${student.classe}

ÉVALUATION ${evaluation.periode} en ${evaluation.matiere} :
- Progrès observés : ${evaluation.progres}
- Comportement : ${evaluation.comportement}
- Autonomie : ${evaluation.autonomie}
- Participation : ${evaluation.participation}

CONSIGNES :
1. Utilise le prénom de l'élève (${student.prenom}) dans le commentaire
2. Adopte un ton ${tone} et bienveillant
3. Mentionne la matière (${evaluation.matiere}) de façon naturelle
4. Adapte le vocabulaire au niveau ${student.niveau}
5. Reste entre 80 et 120 mots
6. Termine par une note d'encouragement ou de conseil constructif
7. Utilise un français soutenu mais accessible

${context}

Commentaire personnalisé :`;
    }

    /**
     * Détermine le contexte éducatif selon le niveau et la matière
     */
    getEducationalContext(niveau, matiere) {
        const contexts = {
            'CP': {
                'Français': 'Focus sur les premiers apprentissages de lecture et écriture, encourager la découverte.',
                'Mathématiques': 'Insister sur la manipulation et la compréhension concrète des nombres.',
                'default': 'Valoriser la curiosité et l\'adaptation à l\'école élémentaire.'
            },
            'CE1': {
                'Français': 'Consolider la lecture, développer l\'expression écrite simple.',
                'Mathématiques': 'Approfondir les opérations et la résolution de problèmes simples.',
                'default': 'Encourager l\'autonomie croissante et la confiance en soi.'
            },
            'CE2': {
                'Français': 'Enrichir le vocabulaire, améliorer la compréhension et l\'expression.',
                'Mathématiques': 'Maîtriser les techniques opératoires et développer le raisonnement.',
                'default': 'Développer les méthodes de travail et l\'organisation.'
            },
            'CM1': {
                'Français': 'Développer l\'analyse de textes et l\'expression structurée.',
                'Mathématiques': 'Approfondir les notions abstraites et la géométrie.',
                'default': 'Renforcer l\'autonomie et la rigueur dans le travail.'
            },
            'CM2': {
                'Français': 'Préparer à l\'entrée au collège avec des textes plus complexes.',
                'Mathématiques': 'Consolider les acquis et préparer aux mathématiques du collège.',
                'default': 'Préparer à l\'entrée au collège avec plus d\'autonomie.'
            }
        };
        
        return contexts[niveau]?.[matiere] || contexts[niveau]?.default || contexts['CE2'].default;
    }

    /**
     * Détermine le ton du commentaire selon l'évaluation
     */
    getToneFromEvaluation(evaluation) {
        const score = this.calculateEvaluationScore(evaluation);
        
        if (score >= 4) return 'très positif et encourageant';
        if (score >= 3) return 'positif et constructif';
        if (score >= 2) return 'bienveillant et exigeant';
        return 'bienveillant et encourageant';
    }

    /**
     * Obtient un commentaire de fallback
     */
    getFallbackComment(student, evaluation, startTime) {
        this.stats.fallbackUsed++;
        
        const template = this.selectFallbackTemplate(student, evaluation);
        const comment = this.replacePlaceholders(template, student, evaluation);
        
        return {
            success: true,
            comment: comment,
            source: 'fallback',
            responseTime: Date.now() - startTime,
            metadata: {
                model: 'fallback-template',
                timestamp: new Date().toISOString(),
                score: this.calculateEvaluationScore(evaluation)
            }
        };
    }

    /**
     * Sélectionne un template de fallback approprié
     */
    selectFallbackTemplate(student, evaluation) {
        const score = this.calculateEvaluationScore(evaluation);
        const templates = {
            excellent: [
                `${student.prenom} fait preuve d'un excellent travail en ${evaluation.matiere}. ${this.getAdjective(evaluation)} et ${this.getAdverb(evaluation)} impliqué(e), il/elle participe activement aux activités et montre une grande motivation. Ses progrès sont remarquables et son attitude en classe est exemplaire. Continuez ainsi !`,
                `${student.prenom} est un(e) élève ${this.getAdjective(evaluation)} en ${evaluation.matiere}. Son travail est ${this.getAdverb(evaluation)} soigné et sa participation est très active. Les progrès réalisés sont significatifs et son attitude en classe est exemplaire. Bravo pour cet excellent trimestre !`,
                `${student.prenom} montre un excellent niveau en ${evaluation.matiere}. Son travail est ${this.getAdverb(evaluation)} rigoureux et sa participation est très active. Les progrès sont remarquables et son attitude en classe est exemplaire. Continuez sur cette belle lancée !`
            ],
            good: [
                `${student.prenom} travaille ${this.getAdverb(evaluation)} bien en ${evaluation.matiere}. Il/elle participe régulièrement et montre de la motivation. Les progrès sont satisfaisants et son comportement en classe est positif. Continuez vos efforts !`,
                `${student.prenom} fait preuve d'un bon travail en ${evaluation.matiere}. Sa participation est régulière et son attitude en classe est positive. Les progrès sont satisfaisants. Poursuivez dans cette voie !`,
                `${student.prenom} montre une bonne implication en ${evaluation.matiere}. Son travail est régulier et sa participation est positive. Les progrès sont satisfaisants. Continuez vos efforts !`
            ],
            average: [
                `${student.prenom} travaille de manière satisfaisante en ${evaluation.matiere}. Sa participation est correcte et son attitude en classe est positive. Quelques efforts supplémentaires permettraient de progresser davantage.`,
                `${student.prenom} fait preuve d'un travail satisfaisant en ${evaluation.matiere}. Sa participation est correcte et son comportement en classe est positif. Un peu plus d'efforts permettraient de mieux progresser.`,
                `${student.prenom} montre une implication satisfaisante en ${evaluation.matiere}. Son travail est correct et sa participation est positive. Quelques efforts supplémentaires seraient bénéfiques.`
            ],
            needsImprovement: [
                `${student.prenom} doit fournir plus d'efforts en ${evaluation.matiere}. Sa participation est irrégulière et son travail pourrait être plus soigné. Un travail plus régulier permettrait de progresser.`,
                `${student.prenom} a besoin de s'investir davantage en ${evaluation.matiere}. Sa participation est limitée et son travail manque de régularité. Plus d'efforts sont nécessaires pour progresser.`,
                `${student.prenom} doit améliorer son travail en ${evaluation.matiere}. Sa participation est faible et son attitude en classe pourrait être plus positive. Un travail plus régulier est nécessaire.`
            ]
        };
        
        let category;
        if (score >= 4) category = 'excellent';
        else if (score >= 3) category = 'good';
        else if (score >= 2) category = 'average';
        else category = 'needsImprovement';
        
        const categoryTemplates = templates[category];
        return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    }

    /**
     * Calcule un score global de l'évaluation
     */
    calculateEvaluationScore(evaluation) {
        const scores = {
            'excellent': 4,
            'tresbien': 4,
            'bien': 3,
            'satisfaisant': 2,
            'correct': 2,
            'ameliorer': 1,
            'insuffisant': 1
        };
        
        const progressScore = scores[evaluation.progres] || 2;
        const behaviorScore = scores[evaluation.comportement] || 2;
        const autonomyScore = scores[evaluation.autonomie] || 2;
        const participationScore = scores[evaluation.participation] || 2;
        
        return (progressScore + behaviorScore + autonomyScore + participationScore) / 4;
    }

    /**
     * Remplace les placeholders dans un template
     */
    replacePlaceholders(template, student, evaluation) {
        return template
            .replace(/\${student\.prenom}/g, student.prenom)
            .replace(/\${student\.nom}/g, student.nom)
            .replace(/\${evaluation\.matiere}/g, evaluation.matiere)
            .replace(/\${evaluation\.periode}/g, evaluation.periode);
    }

    /**
     * Obtient un adjectif approprié selon l'évaluation
     */
    getAdjective(evaluation) {
        const adjectives = {
            excellent: ['excellent', 'remarquable', 'exceptionnel'],
            tresbien: ['très bon', 'très bien', 'excellent'],
            bien: ['bon', 'bien', 'satisfaisant'],
            satisfaisant: ['satisfaisant', 'correct', 'moyen'],
            correct: ['correct', 'satisfaisant', 'moyen'],
            ameliorer: ['à améliorer', 'insuffisant', 'fragile'],
            insuffisant: ['insuffisant', 'à améliorer', 'fragile']
        };
        
        const category = evaluation.progres || 'satisfaisant';
        const categoryAdjectives = adjectives[category] || adjectives.satisfaisant;
        return categoryAdjectives[Math.floor(Math.random() * categoryAdjectives.length)];
    }

    /**
     * Obtient un adverbe approprié selon l'évaluation
     */
    getAdverb(evaluation) {
        const adverbs = {
            excellent: ['très', 'particulièrement', 'extrêmement'],
            tresbien: ['très', 'particulièrement', 'bien'],
            bien: ['bien', 'correctement', 'satisfaisamment'],
            satisfaisant: ['satisfaisamment', 'correctement', 'convenablement'],
            correct: ['correctement', 'satisfaisamment', 'convenablement'],
            ameliorer: ['insuffisamment', 'peu', 'trop peu'],
            insuffisant: ['insuffisamment', 'peu', 'trop peu']
        };
        
        const category = evaluation.progres || 'satisfaisant';
        const categoryAdverbs = adverbs[category] || adverbs.satisfaisant;
        return categoryAdverbs[Math.floor(Math.random() * categoryAdverbs.length)];
    }

    /**
     * Génère une clé de cache unique
     */
    generateCacheKey(student, evaluation) {
        return `${student.id}-${evaluation.periode}-${evaluation.matiere}`;
    }

    /**
     * Vérifie si un cache est valide
     */
    isCacheValid(cached) {
        const now = Date.now();
        const cacheAge = now - cached.timestamp;
        return cacheAge < 24 * 60 * 60 * 1000; // 24 heures
    }

    /**
     * Met en cache un résultat
     */
    cacheResult(student, evaluation, result) {
        const cacheKey = this.generateCacheKey(student, evaluation);
        this.cache.set(cacheKey, {
            comment: result.comment,
            timestamp: Date.now(),
            metadata: result.metadata
        });
    }

    /**
     * Délai entre les tentatives
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Démarre la surveillance du statut
     */
    startStatusMonitoring() {
        if (this.checkInterval) return;
        
        this.checkStatus();
        this.checkInterval = setInterval(() => this.checkStatus(), 30000); // Vérifier toutes les 30 secondes
    }

    /**
     * Vérifie le statut de la connexion
     */
    async checkStatus() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            this.isOnline = response.ok;
            this.lastChecked = new Date();
            
            if (this.isOnline) {
                console.log('[Ollama] Service disponible');
            } else {
                console.warn('[Ollama] Service indisponible');
            }
            
        } catch (error) {
            this.isOnline = false;
            this.lastChecked = new Date();
            console.error('[Ollama] Erreur de connexion:', error.message);
        }
    }

    /**
     * Arrête la surveillance du statut
     */
    stopStatusMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Obtient les statistiques du service
     */
    getStats() {
        return {
            ...this.stats,
            isOnline: this.isOnline,
            lastChecked: this.lastChecked,
            cacheSize: this.cache.size
        };
    }

    /**
     * Réinitialise les statistiques
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            cacheHits: 0,
            fallbackUsed: 0
        };
    }

    /**
     * Vide le cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Exporter le service
export default OllamaService; 