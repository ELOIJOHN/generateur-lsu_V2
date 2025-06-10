// Dashboard.js - Gestion des graphiques et statistiques pour LSU v2.0

// Configuration des graphiques
const chartConfig = {
    levelChart: {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#9C27B0',
                    '#F44336'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    },
    
    evaluationStatusChart: {
        type: 'doughnut',
        data: {
            labels: ['Complètes', 'En cours', 'Non évalués'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    },
    
    gradesChart: {
        type: 'bar',
        data: {
            labels: ['Excellent', 'Très bien', 'Bien', 'Satisfaisant', 'À améliorer'],
            datasets: [{
                label: 'Nombre d\'évaluations',
                data: [0, 0, 0, 0, 0],
                backgroundColor: '#2196F3'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    },
    
    monthlyChart: {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Évaluations complétées',
                data: [],
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
};

// Initialisation des graphiques
let charts = {};

function initializeCharts() {
    Object.keys(chartConfig).forEach(chartId => {
        const ctx = document.getElementById(chartId).getContext('2d');
        charts[chartId] = new Chart(ctx, chartConfig[chartId]);
    });
}

// Mise à jour des statistiques
function updateStats() {
    const students = AppState.students;
    const totalStudents = students.length;
    let completedEvals = 0;
    let inProgressEvals = 0;
    let notStartedEvals = 0;
    
    students.forEach(student => {
        const evaluations = student.evaluations || [];
        if (evaluations.length === 0) {
            notStartedEvals++;
        } else if (evaluations.some(eval => eval.status === 'completed')) {
            completedEvals++;
        } else {
            inProgressEvals++;
        }
    });
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('completedEvals').textContent = completedEvals;
    document.getElementById('inProgressEvals').textContent = inProgressEvals;
    document.getElementById('notStartedEvals').textContent = notStartedEvals;
}

// Mise à jour des graphiques
function updateCharts() {
    const students = AppState.students;
    
    // Répartition par niveau
    const levels = {};
    students.forEach(student => {
        const level = student.level || 'Non spécifié';
        levels[level] = (levels[level] || 0) + 1;
    });
    
    charts.levelChart.data.labels = Object.keys(levels);
    charts.levelChart.data.datasets[0].data = Object.values(levels);
    charts.levelChart.update();
    
    // État des évaluations
    let completed = 0, inProgress = 0, notStarted = 0;
    students.forEach(student => {
        const evaluations = student.evaluations || [];
        if (evaluations.length === 0) {
            notStarted++;
        } else if (evaluations.some(eval => eval.status === 'completed')) {
            completed++;
        } else {
            inProgress++;
        }
    });
    
    charts.evaluationStatusChart.data.datasets[0].data = [completed, inProgress, notStarted];
    charts.evaluationStatusChart.update();
    
    // Distribution des notes
    const grades = [0, 0, 0, 0, 0];
    students.forEach(student => {
        const evaluations = student.evaluations || [];
        evaluations.forEach(eval => {
            if (eval.grade) {
                grades[eval.grade - 1]++;
            }
        });
    });
    
    charts.gradesChart.data.datasets[0].data = grades;
    charts.gradesChart.update();
    
    // Évolution mensuelle
    const months = {};
    students.forEach(student => {
        const evaluations = student.evaluations || [];
        evaluations.forEach(eval => {
            if (eval.date) {
                const month = new Date(eval.date).toLocaleDateString('fr-FR', { month: 'long' });
                months[month] = (months[month] || 0) + 1;
            }
        });
    });
    
    charts.monthlyChart.data.labels = Object.keys(months);
    charts.monthlyChart.data.datasets[0].data = Object.values(months);
    charts.monthlyChart.update();
}

// Mise à jour du tableau d'activité
function updateActivityTable() {
    const activityTable = document.getElementById('activityTable');
    activityTable.innerHTML = '';
    
    const activities = [];
    AppState.students.forEach(student => {
        const evaluations = student.evaluations || [];
        evaluations.forEach(eval => {
            activities.push({
                date: eval.date,
                student: student.name,
                action: 'Évaluation',
                details: `Niveau ${eval.level} - ${eval.subject}`
            });
        });
    });
    
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    activities.slice(0, 10).forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(activity.date).toLocaleDateString('fr-FR')}</td>
            <td>${activity.student}</td>
            <td>${activity.action}</td>
            <td>${activity.details}</td>
        `;
        activityTable.appendChild(row);
    });
}

// Fonctions d'export
function exportToPDF() {
    // TODO: Implémenter l'export PDF
    UIManager.showStatus('Export PDF en cours de développement', 'info');
}

function exportToCSV() {
    const students = AppState.students;
    let csv = 'Nom,Niveau,Date,Note,Commentaire\n';
    
    students.forEach(student => {
        const evaluations = student.evaluations || [];
        evaluations.forEach(eval => {
            csv += `${student.name},${eval.level},${eval.date},${eval.grade},${eval.comment}\n`;
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function exportToJSON() {
    const data = JSON.stringify(AppState.students, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateStats();
    updateCharts();
    updateActivityTable();
}); 