/**
 * ===================================
 * SMART TEMPLATES SERVICE
 * js/smart-templates.js
 * ===================================
 * 
 * Service de gestion des templates intelligents
 * - Templates par niveau
 * - Adaptation contextuelle
 * - Gestion des critères
 * - Calcul des scores
 */

class SmartTemplatesService {
    constructor() {
        this.templates = {
            CP: {
                excellent: [
                    "{{nom}} a fait preuve d'une excellente compréhension en {{matiere}}. {{pronom}} a obtenu {{score}}/20.",
                    "Excellent travail de {{nom}} en {{matiere}} avec {{score}}/20. {{pronom}} a montré une grande maîtrise.",
                    "{{nom}} a brillamment réussi en {{matiere}} avec {{score}}/20. Félicitations !"
                ],
                bien: [
                    "{{nom}} a bien travaillé en {{matiere}} avec {{score}}/20. {{pronom}} progresse régulièrement.",
                    "Bon travail de {{nom}} en {{matiere}} ({{score}}/20). {{pronom}} comprend bien les notions.",
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} montre de bonnes capacités."
                ],
                moyen: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit encore s'entraîner.",
                    "Travail moyen de {{nom}} en {{matiere}} ({{score}}/20). Des efforts sont nécessaires.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit persévérer dans ses efforts."
                ],
                insuffisant: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit travailler davantage.",
                    "Travail insuffisant de {{nom}} en {{matiere}} ({{score}}/20). Un soutien est nécessaire.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit fournir plus d'efforts."
                ]
            },
            CE1: {
                excellent: [
                    "{{nom}} a fait preuve d'une excellente compréhension en {{matiere}}. {{pronom}} a obtenu {{score}}/20.",
                    "Excellent travail de {{nom}} en {{matiere}} avec {{score}}/20. {{pronom}} a montré une grande maîtrise.",
                    "{{nom}} a brillamment réussi en {{matiere}} avec {{score}}/20. Félicitations !"
                ],
                bien: [
                    "{{nom}} a bien travaillé en {{matiere}} avec {{score}}/20. {{pronom}} progresse régulièrement.",
                    "Bon travail de {{nom}} en {{matiere}} ({{score}}/20). {{pronom}} comprend bien les notions.",
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} montre de bonnes capacités."
                ],
                moyen: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit encore s'entraîner.",
                    "Travail moyen de {{nom}} en {{matiere}} ({{score}}/20). Des efforts sont nécessaires.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit persévérer dans ses efforts."
                ],
                insuffisant: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit travailler davantage.",
                    "Travail insuffisant de {{nom}} en {{matiere}} ({{score}}/20). Un soutien est nécessaire.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit fournir plus d'efforts."
                ]
            },
            CE2: {
                excellent: [
                    "{{nom}} a fait preuve d'une excellente compréhension en {{matiere}}. {{pronom}} a obtenu {{score}}/20.",
                    "Excellent travail de {{nom}} en {{matiere}} avec {{score}}/20. {{pronom}} a montré une grande maîtrise.",
                    "{{nom}} a brillamment réussi en {{matiere}} avec {{score}}/20. Félicitations !"
                ],
                bien: [
                    "{{nom}} a bien travaillé en {{matiere}} avec {{score}}/20. {{pronom}} progresse régulièrement.",
                    "Bon travail de {{nom}} en {{matiere}} ({{score}}/20). {{pronom}} comprend bien les notions.",
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} montre de bonnes capacités."
                ],
                moyen: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit encore s'entraîner.",
                    "Travail moyen de {{nom}} en {{matiere}} ({{score}}/20). Des efforts sont nécessaires.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit persévérer dans ses efforts."
                ],
                insuffisant: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit travailler davantage.",
                    "Travail insuffisant de {{nom}} en {{matiere}} ({{score}}/20). Un soutien est nécessaire.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit fournir plus d'efforts."
                ]
            },
            CM1: {
                excellent: [
                    "{{nom}} a fait preuve d'une excellente compréhension en {{matiere}}. {{pronom}} a obtenu {{score}}/20.",
                    "Excellent travail de {{nom}} en {{matiere}} avec {{score}}/20. {{pronom}} a montré une grande maîtrise.",
                    "{{nom}} a brillamment réussi en {{matiere}} avec {{score}}/20. Félicitations !"
                ],
                bien: [
                    "{{nom}} a bien travaillé en {{matiere}} avec {{score}}/20. {{pronom}} progresse régulièrement.",
                    "Bon travail de {{nom}} en {{matiere}} ({{score}}/20). {{pronom}} comprend bien les notions.",
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} montre de bonnes capacités."
                ],
                moyen: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit encore s'entraîner.",
                    "Travail moyen de {{nom}} en {{matiere}} ({{score}}/20). Des efforts sont nécessaires.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit persévérer dans ses efforts."
                ],
                insuffisant: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit travailler davantage.",
                    "Travail insuffisant de {{nom}} en {{matiere}} ({{score}}/20). Un soutien est nécessaire.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit fournir plus d'efforts."
                ]
            },
            CM2: {
                excellent: [
                    "{{nom}} a fait preuve d'une excellente compréhension en {{matiere}}. {{pronom}} a obtenu {{score}}/20.",
                    "Excellent travail de {{nom}} en {{matiere}} avec {{score}}/20. {{pronom}} a montré une grande maîtrise.",
                    "{{nom}} a brillamment réussi en {{matiere}} avec {{score}}/20. Félicitations !"
                ],
                bien: [
                    "{{nom}} a bien travaillé en {{matiere}} avec {{score}}/20. {{pronom}} progresse régulièrement.",
                    "Bon travail de {{nom}} en {{matiere}} ({{score}}/20). {{pronom}} comprend bien les notions.",
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} montre de bonnes capacités."
                ],
                moyen: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit encore s'entraîner.",
                    "Travail moyen de {{nom}} en {{matiere}} ({{score}}/20). Des efforts sont nécessaires.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit persévérer dans ses efforts."
                ],
                insuffisant: [
                    "{{nom}} a obtenu {{score}}/20 en {{matiere}}. {{pronom}} doit travailler davantage.",
                    "Travail insuffisant de {{nom}} en {{matiere}} ({{score}}/20). Un soutien est nécessaire.",
                    "{{nom}} a {{score}}/20 en {{matiere}}. {{pronom}} doit fournir plus d'efforts."
                ]
            }
        };

        this.criteria = {
            CP: {
                francais: ['Lecture', 'Écriture', 'Vocabulaire', 'Grammaire'],
                mathematiques: ['Nombres', 'Calcul', 'Géométrie', 'Mesures'],
                questionner: ['Espace', 'Temps', 'Monde vivant', 'Matériaux'],
                arts: ['Arts visuels', 'Éducation musicale'],
                eps: ['Activités physiques', 'Sports']
            },
            CE1: {
                francais: ['Lecture', 'Écriture', 'Vocabulaire', 'Grammaire', 'Orthographe'],
                mathematiques: ['Nombres', 'Calcul', 'Géométrie', 'Mesures', 'Problèmes'],
                questionner: ['Espace', 'Temps', 'Monde vivant', 'Matériaux', 'Environnement'],
                arts: ['Arts visuels', 'Éducation musicale'],
                eps: ['Activités physiques', 'Sports', 'Jeux collectifs']
            },
            CE2: {
                francais: ['Lecture', 'Écriture', 'Vocabulaire', 'Grammaire', 'Orthographe', 'Conjugaison'],
                mathematiques: ['Nombres', 'Calcul', 'Géométrie', 'Mesures', 'Problèmes', 'Fractions'],
                questionner: ['Espace', 'Temps', 'Monde vivant', 'Matériaux', 'Environnement', 'Technologie'],
                arts: ['Arts visuels', 'Éducation musicale', 'Histoire des arts'],
                eps: ['Activités physiques', 'Sports', 'Jeux collectifs', 'Natation']
            },
            CM1: {
                francais: ['Lecture', 'Écriture', 'Vocabulaire', 'Grammaire', 'Orthographe', 'Conjugaison', 'Production d\'écrits'],
                mathematiques: ['Nombres', 'Calcul', 'Géométrie', 'Mesures', 'Problèmes', 'Fractions', 'Décimaux'],
                questionner: ['Espace', 'Temps', 'Monde vivant', 'Matériaux', 'Environnement', 'Technologie', 'Histoire'],
                arts: ['Arts visuels', 'Éducation musicale', 'Histoire des arts'],
                eps: ['Activités physiques', 'Sports', 'Jeux collectifs', 'Natation', 'Athlétisme']
            },
            CM2: {
                francais: ['Lecture', 'Écriture', 'Vocabulaire', 'Grammaire', 'Orthographe', 'Conjugaison', 'Production d\'écrits', 'Littérature'],
                mathematiques: ['Nombres', 'Calcul', 'Géométrie', 'Mesures', 'Problèmes', 'Fractions', 'Décimaux', 'Proportionnalité'],
                questionner: ['Espace', 'Temps', 'Monde vivant', 'Matériaux', 'Environnement', 'Technologie', 'Histoire', 'Géographie'],
                arts: ['Arts visuels', 'Éducation musicale', 'Histoire des arts'],
                eps: ['Activités physiques', 'Sports', 'Jeux collectifs', 'Natation', 'Athlétisme', 'Gymnastique']
            }
        };
    }

    /**
     * Obtient un template pour un niveau et une performance donnés
     */
    getTemplate(level, performance) {
        const templates = this.templates[level]?.[performance];
        if (!templates) {
            throw new Error(`Template non trouvé pour le niveau ${level} et la performance ${performance}`);
        }
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Obtient les critères pour un niveau et une matière donnés
     */
    getCriteria(level, subject) {
        const criteria = this.criteria[level]?.[subject];
        if (!criteria) {
            throw new Error(`Critères non trouvés pour le niveau ${level} et la matière ${subject}`);
        }
        return criteria;
    }

    /**
     * Calcule le niveau de performance
     */
    calculatePerformance(score) {
        if (score >= 16) return 'excellent';
        if (score >= 14) return 'bien';
        if (score >= 10) return 'moyen';
        return 'insuffisant';
    }

    /**
     * Génère un commentaire personnalisé
     */
    generateComment(student, evaluation) {
        const { level, subject, score } = evaluation;
        const performance = this.calculatePerformance(score);
        const template = this.getTemplate(level, performance);
        
        return template
            .replace('{{nom}}', student.name)
            .replace('{{pronom}}', student.gender === 'F' ? 'Elle' : 'Il')
            .replace('{{matiere}}', subject)
            .replace('{{score}}', score);
    }

    /**
     * Calcule la moyenne des scores
     */
    calculateAverage(scores) {
        if (!scores || scores.length === 0) return 0;
        const sum = scores.reduce((acc, score) => acc + score, 0);
        return sum / scores.length;
    }

    /**
     * Obtient les statistiques d'évaluation
     */
    getEvaluationStats(evaluations) {
        const stats = {
            total: evaluations.length,
            excellent: 0,
            bien: 0,
            moyen: 0,
            insuffisant: 0,
            average: 0
        };

        evaluations.forEach(eval => {
            const performance = this.calculatePerformance(eval.score);
            stats[performance]++;
        });

        stats.average = this.calculateAverage(evaluations.map(e => e.score));
        return stats;
    }
}

// Exporter le service
export default SmartTemplatesService; 