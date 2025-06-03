<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Système d'Évaluation des Élèves</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #ffffff;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* Animations */
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
        }

        @keyframes glow {
            0% {
                box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
            }
            50% {
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
            }
            100% {
                box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
            }
        }

        /* Layout */
        .container {
            display: flex;
            height: 100vh;
            position: relative;
        }

        /* Sidebar */
        .sidebar {
            width: 300px;
            background: rgba(20, 20, 35, 0.8);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            padding: 30px;
            overflow-y: auto;
            animation: slideIn 0.5s ease-out;
        }

        .logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 40px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo::before {
            content: "📊";
            font-size: 30px;
            -webkit-text-fill-color: initial;
        }

        .student-list {
            margin-top: 30px;
        }

        .student-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .student-item:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateX(5px);
        }

        .student-item.active {
            background: rgba(59, 130, 246, 0.2);
            border-color: #3b82f6;
            animation: pulse 2s infinite;
        }

        .student-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
        }

        .student-info h3 {
            font-size: 16px;
            margin-bottom: 2px;
        }

        .student-info p {
            font-size: 12px;
            opacity: 0.7;
        }

        .add-student {
            width: 100%;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border: none;
            border-radius: 12px;
            padding: 15px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
        }

        .add-student:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
            animation: slideIn 0.5s ease-out 0.2s both;
        }

        .header {
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header p {
            opacity: 0.7;
        }

        /* Info Cards */
        .info-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .info-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .info-card:hover {
            transform: translateY(-5px);
            border-color: rgba(59, 130, 246, 0.3);
        }

        .info-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
        }

        .info-card label {
            display: block;
            font-size: 12px;
            opacity: 0.7;
            margin-bottom: 8px;
        }

        .info-card select {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 10px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .info-card select:hover {
            border-color: #3b82f6;
        }

        .info-card select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .info-card select option {
            background: #1a1a2e;
            color: white;
        }

        /* Evaluation Section */
        .evaluation-section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: "⚡";
            font-size: 24px;
        }

        .evaluation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .evaluation-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .evaluation-card:hover {
            transform: translateY(-5px);
            border-color: rgba(59, 130, 246, 0.3);
        }

        .evaluation-card h3 {
            font-size: 16px;
            margin-bottom: 15px;
            opacity: 0.9;
        }

        .rating-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .rating-btn {
            padding: 12px 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            position: relative;
            overflow: hidden;
        }

        .rating-btn:hover {
            transform: translateX(5px);
            border-color: rgba(59, 130, 246, 0.5);
        }

        .rating-btn.excellent {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
        }

        .rating-btn.bien {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: none;
        }

        .rating-btn.satisfaisant {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: none;
        }

        .rating-btn.ameliorer {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: none;
        }

        .rating-btn.active {
            animation: glow 2s ease-in-out infinite;
            transform: scale(1.05);
        }

        /* Action Buttons */
        .actions {
            display: flex;
            gap: 20px;
            margin-top: 40px;
            flex-wrap: wrap;
        }

        .action-btn {
            padding: 15px 30px;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            position: relative;
            overflow: hidden;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }

        .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
        }

        .btn-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }

        .btn-warning {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }

        /* Comment Section */
        .comment-section {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 30px;
            margin-top: 40px;
        }

        .comment-section h2 {
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .comment-section h2::before {
            content: "💬";
            font-size: 24px;
        }

        .comment-textarea {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 15px;
            color: white;
            font-size: 14px;
            line-height: 1.6;
            min-height: 150px;
            resize: vertical;
            transition: all 0.3s ease;
        }

        .comment-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .comment-actions {
            display: flex;
            gap: 15px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal.show {
            display: flex;
        }

        .modal-content {
            background: rgba(20, 20, 35, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            animation: slideIn 0.3s ease-out;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .modal-header h2 {
            font-size: 24px;
        }

        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }

        .close-btn:hover {
            opacity: 1;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            opacity: 0.7;
        }

        .form-group input, .form-group select {
            width: 100%;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 14px;
        }

        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .form-group select option {
            background: #1a1a2e;
            color: white;
        }

        /* Status Messages */
        .status-message {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        }

        .status-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .status-error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .status-warning {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                width: 250px;
            }
            
            .main-content {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .evaluation-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 600px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                border-right: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding: 20px;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .action-btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">Gestion des Élèves</div>
            
            <div class="student-list">
                <h2 style="font-size: 18px; margin-bottom: 20px; opacity: 0.9;">Élèves</h2>
                
                <div id="students-container">
                    <!-- Les élèves seront ajoutés ici dynamiquement -->
                </div>
                
                <button class="add-student" id="addStudentBtn">+ Ajouter un élève</button>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="main-content">
            <div class="header">
                <h1 id="currentStudentName">Sélectionnez un élève</h1>
                <p>Génération automatique de commentaires personnalisés</p>
            </div>
            
            <!-- Info Cards -->
            <div class="info-cards">
                <div class="info-card">
                    <label>Niveau</label>
                    <select id="eleveNiveauCentral" class="form-select">
                        <option value="cp">CP</option>
                        <option value="ce1">CE1</option>
                        <option value="ce2">CE2</option>
                        <option value="cm1">CM1</option>
                        <option value="cm2">CM2</option>
                    </select>
                </div>
                
                <div class="info-card">
                    <label>Période</label>
                    <select id="periodeSelect" class="form-select">
                        <option value="t1">Trimestre 1</option>
                        <option value="t2">Trimestre 2</option>
                        <option value="t3">Trimestre 3</option>
                    </select>
                </div>
                
                <div class="info-card">
                    <label>Matière</label>
                    <select id="matiereSelect" class="form-select">
                        <option value="francais">Français</option>
                        <option value="maths">Mathématiques</option>
                        <option value="histoire">Histoire</option>
                        <option value="sciences">Sciences</option>
                        <option value="eps">EPS</option>
                        <option value="arts">Arts plastiques</option>
                    </select>
                </div>
            </div>
            
            <!-- Evaluation Section -->
            <div class="evaluation-section">
                <h2 class="section-title">Évaluation des Compétences</h2>
                
                <div class="evaluation-grid">
                    <div class="evaluation-card">
                        <h3>📈 Progrès observés</h3>
                        <div class="rating-buttons">
                            <button class="rating-btn excellent" data-category="progres" data-value="excellent">Excellent</button>
                            <button class="rating-btn bien" data-category="progres" data-value="bien">Bien</button>
                            <button class="rating-btn satisfaisant" data-category="progres" data-value="satisfaisant">Satisfaisant</button>
                            <button class="rating-btn ameliorer" data-category="progres" data-value="ameliorer">À améliorer</button>
                        </div>
                    </div>
                    
                    <div class="evaluation-card">
                        <h3>🎯 Comportement</h3>
                        <div class="rating-buttons">
                            <button class="rating-btn excellent" data-category="comportement" data-value="excellent">Excellent</button>
                            <button class="rating-btn bien" data-category="comportement" data-value="tresbien">Très bien</button>
                            <button class="rating-btn satisfaisant" data-category="comportement" data-value="correct">Correct</button>
                            <button class="rating-btn ameliorer" data-category="comportement" data-value="surveiller">À surveiller</button>
                        </div>
                    </div>
                    
                    <div class="evaluation-card">
                        <h3>🚀 Autonomie</h3>
                        <div class="rating-buttons">
                            <button class="rating-btn excellent" data-category="autonomie" data-value="excellente">Excellente</button>
                            <button class="rating-btn bien" data-category="autonomie" data-value="bonne">Bonne</button>
                            <button class="rating-btn satisfaisant" data-category="autonomie" data-value="moyenne">Moyenne</button>
                            <button class="rating-btn ameliorer" data-category="autonomie" data-value="insuffisante">Insuffisante</button>
                        </div>
                    </div>
                    
                    <div class="evaluation-card">
                        <h3>💡 Participation</h3>
                        <div class="rating-buttons">
                            <button class="rating-btn excellent" data-category="participation" data-value="tresactive">Très active</button>
                            <button class="rating-btn bien" data-category="participation" data-value="active">Active</button>
                            <button class="rating-btn satisfaisant" data-category="participation" data-value="moderee">Modérée</button>
                            <button class="rating-btn ameliorer" data-category="participation" data-value="discrete">Discrète</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="actions">
                <button class="action-btn btn-primary" id="generateBtn">
                    <span>🤖</span>
                    <span>Générer avec IA</span>
                </button>
                
                <button class="action-btn btn-success" id="saveBtn">
                    <span>💾</span>
                    <span>Sauvegarder profil</span>
                </button>
                
                <button class="action-btn btn-warning" id="resetBtn">
                    <span>🔄</span>
                    <span>Réinitialiser</span>
                </button>
                
                <button class="action-btn btn-primary" id="exportBtn">
                    <span>📤</span>
                    <span>Exporter</span>
                </button>
                
                <button class="action-btn btn-primary" id="importBtn">
                    <span>📥</span>
                    <span>Importer</span>
                </button>
            </div>
            
            <!-- Comment Section -->
            <div class="comment-section">
                <h2>Commentaire généré</h2>
                <textarea class="comment-textarea" id="commentaire" placeholder="Sélectionnez les évaluations puis cliquez sur 'Générer avec IA' pour créer un commentaire personnalisé..."></textarea>
                
                <div class="comment-actions">
                    <button class="action-btn btn-primary" id="copyBtn">
                        <span>📋</span>
                        <span>Copier</span>
                    </button>
                    
                    <button class="action-btn btn-primary" id="shareBtn">
                        <span>📢</span>
                        <span>Partager</span>
                    </button>
                    
                    <button class="action-btn btn-primary" id="variantBtn">
                        <span>🔄</span>
                        <span>3 Variantes</span>
                    </button>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Modal -->
    <div class="modal" id="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Titre du Modal</h2>
                <button class="close-btn" id="closeModalBtn">&times;</button>
            </div>
            <div class="modal-body" id="modalBody">
                <!-- Content will be dynamically inserted -->
            </div>
        </div>
    </div>

    <script>
        // Variables globales
        let studentsList = [];
        let currentStudentId = null;
        let evaluations = {
            progres: null,
            comportement: null,
            autonomie: null,
            participation: null
        };

        // Initialisation des élèves par défaut
        function initializeDefaultStudents() {
            const defaultStudents = [
                {
                    id: 'john-cp',
                    nom: 'John Doe',
                    niveau: 'cp',
                    classe: 'CP-A',
                    evaluations: {}
                },
                {
                    id: 'marie-ce1',
                    nom: 'Marie Leblanc',
                    niveau: 'ce1',
                    classe: 'CE1-B',
                    evaluations: {}
                },
                {
                    id: 'paul-ce1',
                    nom: 'Paul Durand',
                    niveau: 'ce1',
                    classe: 'CE1-B',
                    evaluations: {}
                }
            ];

            // Charger depuis localStorage ou utiliser les valeurs par défaut
            const savedStudents = localStorage.getItem('studentsList');
            if (savedStudents) {
                studentsList = JSON.parse(savedStudents);
            } else {
                studentsList = defaultStudents;
                saveStudentsToStorage();
            }
        }

        // Sauvegarder dans localStorage
        function saveStudentsToStorage() {
            localStorage.setItem('studentsList', JSON.stringify(studentsList));
        }

        // Afficher la liste des élèves
        function renderStudentsList() {
            const container = document.getElementById('students-container');
            container.innerHTML = '';

            studentsList.forEach(student => {
                const studentDiv = document.createElement('div');
                studentDiv.className = `student-item ${currentStudentId === student.id ? 'active' : ''}`;
                studentDiv.dataset.studentId = student.id;
                
                const initials = student.nom.split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                studentDiv.innerHTML = `
                    <div class="student-avatar">${initials}</div>
                    <div class="student-info">
                        <h3>${student.nom}</h3>
                        <p>${student.niveau.toUpperCase()}${student.classe ? ' - ' + student.classe : ''}</p>
                    </div>
                `;

                studentDiv.addEventListener('click', () => selectStudent(student.id));
                container.appendChild(studentDiv);
            });
        }

        // Sélectionner un élève
        function selectStudent(studentId) {
            currentStudentId = studentId;
            const student = studentsList.find(s => s.id === studentId);
            
            if (!student) return;

            // Mettre à jour l'interface
            document.getElementById('currentStudentName').textContent = `Évaluation de ${student.nom}`;
            document.getElementById('eleveNiveauCentral').value = student.niveau;
            
            // Mettre à jour la classe active
            document.querySelectorAll('.student-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-student-id="${studentId}"]`).classList.add('active');

            // Réinitialiser les évaluations
            resetEvaluations();

            // Charger les évaluations sauvegardées si elles existent
            if (student.evaluations) {
                Object.entries(student.evaluations).forEach(([category, value]) => {
                    const btn = document.querySelector(`[data-category="${category}"][data-value="${value}"]`);
                    if (btn) {
                        btn.click();
                    }
                });
            }

            showStatusMessage('Élève sélectionné : ' + student.nom, 'success');
        }

        // Réinitialiser les évaluations
        function resetEvaluations() {
            // Réinitialiser les boutons
            document.querySelectorAll('.rating-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Réinitialiser l'objet evaluations
            Object.keys(evaluations).forEach(key => {
                evaluations[key] = null;
            });

            // Vider le comment