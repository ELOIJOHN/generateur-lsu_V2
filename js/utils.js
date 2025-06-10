/**
 * ===================================
 * UTILITIES SERVICE
 * js/utils.js
 * ===================================
 * 
 * Fonctions utilitaires pour LSU
 * - Manipulation de données
 * - Formatage
 * - Validation
 * - Helpers
 */

/**
 * Formate une date en format français
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Formate un nombre avec séparateur de milliers
 */
export const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number);
};

/**
 * Génère un ID unique
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Valide une adresse email
 */
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Valide un numéro de téléphone français
 */
export const validatePhone = (phone) => {
    const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return re.test(phone);
};

/**
 * Débounce une fonction
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle une fonction
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Copie un texte dans le presse-papier
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        return false;
    }
};

/**
 * Sauvegarde des données dans le localStorage
 */
export const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (err) {
        console.error('Erreur lors de la sauvegarde:', err);
        return false;
    }
};

/**
 * Récupère des données du localStorage
 */
export const getFromStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Erreur lors de la récupération:', err);
        return null;
    }
};

/**
 * Supprime des données du localStorage
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        return false;
    }
};

/**
 * Calcule la moyenne d'un tableau de notes
 */
export const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return sum / grades.length;
};

/**
 * Formate une note sur 20
 */
export const formatGrade = (grade) => {
    return grade.toFixed(2).replace('.', ',');
};

/**
 * Détermine le niveau de performance
 */
export const getPerformanceLevel = (average) => {
    if (average >= 16) return 'excellent';
    if (average >= 14) return 'très bien';
    if (average >= 12) return 'bien';
    if (average >= 10) return 'moyen';
    return 'insuffisant';
};

/**
 * Génère un mot de passe aléatoire
 */
export const generatePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

/**
 * Vérifie si un objet est vide
 */
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

/**
 * Nettoie un objet en supprimant les valeurs null/undefined
 */
export const cleanObject = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v != null)
    );
};

/**
 * Fusionne deux objets en profondeur
 */
export const deepMerge = (target, source) => {
    const result = { ...target };
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
};

/**
 * Attend un délai spécifié
 */
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Vérifie si une valeur est un nombre
 */
export const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Formate une durée en minutes en format lisible
 */
export const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
};

/**
 * Trie un tableau d'objets par une propriété
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        }
        return a[key] < b[key] ? 1 : -1;
    });
};

/**
 * Filtre un tableau d'objets selon des critères
 */
export const filterBy = (array, criteria) => {
    return array.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
            if (typeof value === 'string') {
                return item[key].toLowerCase().includes(value.toLowerCase());
            }
            return item[key] === value;
        });
    });
};

/**
 * Groupe un tableau d'objets par une propriété
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        result[group] = result[group] || [];
        result[group].push(item);
        return result;
    }, {});
};

/**
 * Calcule les statistiques d'un tableau de nombres
 */
export const calculateStats = (numbers) => {
    if (!numbers || numbers.length === 0) return null;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / sorted.length;
    const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    
    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean,
        median,
        sum,
        count: sorted.length
    };
}; 