// Students.js - Gestion des élèves pour LSU v2.0

// Variables globales
let filteredStudents = [];
let currentFilters = {
    search: '',
    level: '',
    status: ''
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        filterStudents();
    });
}

// Chargement des élèves
function loadStudents() {
    filteredStudents = [...AppState.students];
    updateStudentsTable();
}

// Mise à jour du tableau des élèves
function updateStudentsTable() {
    const tableBody = document.getElementById('studentsTable');
    tableBody.innerHTML = '';
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        
        // Statut des évaluations
        const evaluations = student.evaluations || [];
        let status = 'Non évalué';
        let statusClass = 'status-not-started';
        
        if (evaluations.length > 0) {
            if (evaluations.some(eval => eval.status === 'completed')) {
                status = 'Complet';
                statusClass = 'status-completed';
            } else {
                status = 'En cours';
                statusClass = 'status-in-progress';
            }
        }
        
        // Dernière évaluation
        const lastEvaluation = evaluations.length > 0 
            ? new Date(evaluations[evaluations.length - 1].date).toLocaleDateString('fr-FR')
            : '-';
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.level}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${lastEvaluation}</td>
            <td>
                <button class="btn btn-icon" onclick="editStudent('${student.id}')" title="Modifier">
                    <span>✏️</span>
                </button>
                <button class="btn btn-icon" onclick="deleteStudent('${student.id}')" title="Supprimer">
                    <span>🗑️</span>
                </button>
                <button class="btn btn-icon" onclick="viewEvaluations('${student.id}')" title="Voir les évaluations">
                    <span>📋</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Filtrage des élèves
function filterStudents() {
    const levelFilter = document.getElementById('levelFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    currentFilters.level = levelFilter;
    currentFilters.status = statusFilter;
    
    filteredStudents = AppState.students.filter(student => {
        // Filtre par recherche
        if (currentFilters.search && !student.name.toLowerCase().includes(currentFilters.search.toLowerCase())) {
            return false;
        }
        
        // Filtre par niveau
        if (currentFilters.level && student.level !== currentFilters.level) {
            return false;
        }
        
        // Filtre par statut
        if (currentFilters.status) {
            const evaluations = student.evaluations || [];
            let status = 'not_started';
            
            if (evaluations.length > 0) {
                if (evaluations.some(eval => eval.status === 'completed')) {
                    status = 'completed';
                } else {
                    status = 'in_progress';
                }
            }
            
            if (status !== currentFilters.status) {
                return false;
            }
        }
        
        return true;
    });
    
    updateStudentsTable();
}

// Gestion des modales
function showAddStudentModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter un élève';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('studentModal').style.display = 'block';
}

function showEditStudentModal(student) {
    document.getElementById('modalTitle').textContent = 'Modifier un élève';
    document.getElementById('studentId').value = student.id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentLevel').value = student.level;
    document.getElementById('studentNotes').value = student.notes || '';
    document.getElementById('studentModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
    document.getElementById('importModal').style.display = 'none';
}

// Gestion des élèves
function handleStudentSubmit(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentData = {
        name: document.getElementById('studentName').value,
        level: document.getElementById('studentLevel').value,
        notes: document.getElementById('studentNotes').value
    };
    
    if (studentId) {
        // Modification
        const index = AppState.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            AppState.students[index] = { ...AppState.students[index], ...studentData };
        }
    } else {
        // Ajout
        studentData.id = generateId();
        studentData.evaluations = [];
        AppState.students.push(studentData);
    }
    
    StorageManager.saveStudents(AppState.students);
    loadStudents();
    closeModal();
    UIManager.showStatus('Élève enregistré avec succès', 'success');
}

function editStudent(id) {
    const student = AppState.students.find(s => s.id === id);
    if (student) {
        showEditStudentModal(student);
    }
}

function deleteStudent(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
        AppState.students = AppState.students.filter(s => s.id !== id);
        StorageManager.saveStudents(AppState.students);
        loadStudents();
        UIManager.showStatus('Élève supprimé avec succès', 'success');
    }
}

function viewEvaluations(id) {
    // Redirection vers la page de génération avec l'élève sélectionné
    window.location.href = `index.html?student=${id}`;
}

// Import/Export
function importStudents() {
    document.getElementById('importModal').style.display = 'block';
}

function handleImport(event) {
    event.preventDefault();
    
    const file = document.getElementById('importFile').files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let students;
            if (file.name.endsWith('.json')) {
                students = JSON.parse(e.target.result);
            } else if (file.name.endsWith('.csv')) {
                students = parseCSV(e.target.result);
            }
            
            if (Array.isArray(students)) {
                AppState.students = students.map(student => ({
                    ...student,
                    id: student.id || generateId(),
                    evaluations: student.evaluations || []
                }));
                
                StorageManager.saveStudents(AppState.students);
                loadStudents();
                closeModal();
                UIManager.showStatus('Import réussi', 'success');
            }
        } catch (error) {
            UIManager.showStatus('Erreur lors de l\'import', 'error');
        }
    };
    
    reader.readAsText(file);
}

function exportStudents() {
    const data = JSON.stringify(AppState.students, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eleves_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// Utilitaires
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const student = {};
        
        headers.forEach((header, index) => {
            student[header.trim()] = values[index]?.trim() || '';
        });
        
        return student;
    });
} 