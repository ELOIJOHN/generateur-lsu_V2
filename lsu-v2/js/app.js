// LSU v2.0 - Main Application

// Configuration
const CONFIG = {
    OLLAMA_API_URL: 'http://localhost:11434',
    N8N_INTERFACE_URL: 'http://localhost:5678',
    N8N_WEBHOOK_URL: 'http://localhost:5678/webhook-test/generer-commentaire',
    STORAGE_KEY: 'lsu-students-v2'
};

// Modèles disponibles
const AVAILABLE_MODELS = [
    { id: 'llama2', name: 'Llama 2' },
    { id: 'mistral', name: 'Mistral' }
];

// État global de l'application
const AppState = {
    students: [],
    currentStudentId: null,
    evaluations: {
        progres: null,
        comportement: null,
        autonomie: null,
        participation: null
    }
};

// Gestionnaire de stockage
const StorageManager = {
    save() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(AppState.students));
    },

    load() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (data) {
            AppState.students = JSON.parse(data);
        }
    }
};

// Gestionnaire d'élèves
const StudentManager = {
    add(student) {
        AppState.students.push({
            id: `${student.nom.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            ...student,
            evaluations: {}
        });
        StorageManager.save();
    },

    update(id, data) {
        const index = AppState.students.findIndex(s => s.id === id);
        if (index !== -1) {
            AppState.students[index] = { ...AppState.students[index], ...data };
            StorageManager.save();
        }
    },

    delete(id) {
        AppState.students = AppState.students.filter(s => s.id !== id);
        StorageManager.save();
    },

    get(id) {
        return AppState.students.find(s => s.id === id);
    },

    getAll() {
        return AppState.students;
    }
};

// Gestionnaire d'évaluations
const EvaluationManager = {
    setEvaluation(studentId, category, value) {
        const student = StudentManager.get(studentId);
        if (student) {
            if (!student.evaluations) student.evaluations = {};
            student.evaluations[category] = value;
            StorageManager.save();
        }
    },

    getEvaluation(studentId, category) {
        const student = StudentManager.get(studentId);
        return student?.evaluations?.[category] || null;
    },

    getAllEvaluations(studentId) {
        const student = StudentManager.get(studentId);
        return student?.evaluations || {};
    }
};

// Gestionnaire d'IA
const AIManager = {
    async generateComment(studentId, options = {}) {
        try {
            const student = StudentManager.get(studentId);
            if (!student) throw new Error('Élève non trouvé');

            const evaluations = EvaluationManager.getAllEvaluations(studentId);
            const hasEvaluations = Object.values(evaluations).some(val => val !== null);
            if (!hasEvaluations) throw new Error('Aucune évaluation sélectionnée');

            const requestData = {
                model: options.model || 'mistral',
                prompt: this.buildPrompt(student, evaluations, options),
                stream: false
            };

            const response = await fetch(`${CONFIG.OLLAMA_API_URL}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

            const data = await response.json();
            return data.response?.trim() || '';
        } catch (error) {
            console.error('Erreur génération commentaire:', error);
            throw error;
        }
    },

    buildPrompt(student, evaluations, options) {
        return `Génère un commentaire pour un élève de primaire avec les critères suivants :
Nom: ${student.nom}
Niveau: ${options.niveau || student.niveau}
Matière: ${options.matiere || 'Général'}
Période: ${options.periode || 'Trimestre 1'}
Compétences:
${Object.entries(evaluations)
    .filter(([_, value]) => value !== null)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n')}`;
    }
};

// Gestionnaire d'interface
const UIManager = {
    showStatus(message, type = 'info') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);

        setTimeout(() => statusDiv.remove(), 4000);
    },

    showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('show');
    },

    closeModal() {
        document.getElementById('modal').classList.remove('show');
    },

    updateStudentList() {
        const container = document.getElementById('students-container');
        if (!container) return;

        container.innerHTML = AppState.students.map(student => {
            const evaluatedCount = Object.values(student.evaluations || {})
                .filter(val => val !== null).length;
            
            return `
                <div class="student-item ${AppState.currentStudentId === student.id ? 'active' : ''}"
                     data-student-id="${student.id}">
                    <div class="student-avatar" style="background: ${this.getAvatarColor(student.id)}">
                        ${this.getInitials(student.nom)}
                    </div>
                    <div class="student-info">
                        <h4>${student.nom}</h4>
                        <p>${student.niveau.toUpperCase()} - ${student.classe}</p>
                        <p style="font-size: 10px; color: ${this.getStatusColor(evaluatedCount)};">
                            ${this.getStatusText(evaluatedCount)}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
    },

    getInitials(name) {
        return name.split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    getAvatarColor(id) {
        const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffecd2'];
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    },

    getStatusColor(count) {
        if (count === 4) return '#10b981';
        if (count > 0) return '#f59e0b';
        return '#6b7280';
    },

    getStatusText(count) {
        if (count === 4) return '✓ Évaluation complète';
        if (count > 0) return `⚠️ ${count}/4 évalué(s)`;
        return 'Aucune évaluation';
    }
};

// Initialisation de l'application
function initializeApp() {
    console.log('🚀 Initialisation application...');
    
    // Charger les données
    StorageManager.load();
    
    // Initialiser l'interface
    UIManager.updateStudentList();
    
    // Attacher les event listeners
    attachEventListeners();
    
    // Test de connexion Ollama
    testOllamaConnection();
    
    console.log('✅ Application initialisée !');
    UIManager.showStatus('Générateur LSU V2 prêt ! 🚀', 'success');
}

// Test de connexion Ollama
async function testOllamaConnection() {
    try {
        const response = await fetch(`${CONFIG.OLLAMA_API_URL}/api/tags`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log('✅ Connexion Ollama réussie:', data);
        UIManager.showStatus('Connexion Ollama établie', 'success');
        return true;
    } catch (error) {
        console.error('❌ Erreur connexion Ollama:', error);
        UIManager.showStatus('Erreur de connexion à Ollama', 'error');
        return false;
    }
}

// Attacher les event listeners
function attachEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page) loadPage(page);
        });
    });

    // Boutons d'évaluation
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            const value = e.target.dataset.value;
            if (AppState.currentStudentId && category && value) {
                EvaluationManager.setEvaluation(AppState.currentStudentId, category, value);
                UIManager.updateStudentList();
            }
        });
    });

    // Autres boutons
    document.getElementById('generateBtn')?.addEventListener('click', generateComment);
    document.getElementById('addStudentBtn')?.addEventListener('click', showAddStudentModal);
    document.getElementById('exportBtn')?.addEventListener('click', showExportMenu);
}

// Générer un commentaire
async function generateComment() {
    try {
        if (!AppState.currentStudentId) {
            UIManager.showStatus('Aucun élève sélectionné', 'error');
            return;
        }

        UIManager.showStatus('Génération du commentaire en cours...', 'info');

        const comment = await AIManager.generateComment(AppState.currentStudentId, {
            niveau: document.getElementById('niveauSelect')?.value,
            periode: document.getElementById('periodeSelect')?.value,
            matiere: document.getElementById('matiereSelect')?.value,
            model: document.getElementById('modelSelect')?.value
        });

        document.getElementById('commentaire').value = comment;
        UIManager.showStatus('✅ Commentaire généré avec succès !', 'success');
    } catch (error) {
        console.error('Erreur génération:', error);
        UIManager.showStatus(`Erreur: ${error.message}`, 'error');
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', initializeApp); 