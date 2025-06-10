/**
 * ===================================
 * TESTS FONCTIONNELS LSU
 * js/tests.js
 * ===================================
 */

import { OllamaService } from './ollama-enhanced.js';
import { SmartTemplatesService } from './smart-templates.js';
import { ErrorHandler } from './error-handler.js';
import { PDFGenerator } from './pdf-generator.js';
import * as Utils from './utils.js';

class LSUTests {
    constructor() {
        this.ollamaService = new OllamaService();
        this.templatesService = new SmartTemplatesService();
        this.errorHandler = new ErrorHandler();
        this.pdfGenerator = new PDFGenerator();
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * Exécute tous les tests
     */
    async runAllTests() {
        console.log('🚀 Démarrage des tests LSU...\n');

        // Test 1: Connexion Ollama
        await this.testOllamaConnection();

        // Test 2: CRUD Élèves
        await this.testStudentCRUD();

        // Test 3: Responsive Design
        await this.testResponsiveDesign();

        // Test 4: Fallback Ollama
        await this.testOllamaFallback();

        // Résultats finaux
        this.displayResults();
    }

    /**
     * Test de la connexion Ollama
     */
    async testOllamaConnection() {
        console.log('📡 Test de la connexion Ollama...');
        
        try {
            const isConnected = await this.ollamaService.checkConnection();
            this.assertTest('Connexion Ollama', isConnected);
            
            if (isConnected) {
                const models = await this.ollamaService.getAvailableModels();
                this.assertTest('Récupération des modèles', models.length > 0);
            }
        } catch (error) {
            this.assertTest('Connexion Ollama', false, error.message);
        }
    }

    /**
     * Test du CRUD des élèves
     */
    async testStudentCRUD() {
        console.log('\n👥 Test du CRUD des élèves...');

        const testStudent = {
            id: Utils.generateId(),
            name: 'Test Élève',
            level: 'CP',
            class: 'CP-A',
            evaluations: []
        };

        // Create
        try {
            await Utils.saveToStorage(`student_${testStudent.id}`, testStudent);
            const savedStudent = await Utils.getFromStorage(`student_${testStudent.id}`);
            this.assertTest('Création élève', savedStudent.id === testStudent.id);
        } catch (error) {
            this.assertTest('Création élève', false, error.message);
        }

        // Read
        try {
            const student = await Utils.getFromStorage(`student_${testStudent.id}`);
            this.assertTest('Lecture élève', student.name === testStudent.name);
        } catch (error) {
            this.assertTest('Lecture élève', false, error.message);
        }

        // Update
        try {
            testStudent.name = 'Test Élève Modifié';
            await Utils.saveToStorage(`student_${testStudent.id}`, testStudent);
            const updatedStudent = await Utils.getFromStorage(`student_${testStudent.id}`);
            this.assertTest('Modification élève', updatedStudent.name === testStudent.name);
        } catch (error) {
            this.assertTest('Modification élève', false, error.message);
        }

        // Delete
        try {
            await Utils.removeFromStorage(`student_${testStudent.id}`);
            const deletedStudent = await Utils.getFromStorage(`student_${testStudent.id}`);
            this.assertTest('Suppression élève', deletedStudent === null);
        } catch (error) {
            this.assertTest('Suppression élève', false, error.message);
        }
    }

    /**
     * Test du responsive design
     */
    async testResponsiveDesign() {
        console.log('\n📱 Test du responsive design...');

        const breakpoints = [
            { width: 320, name: 'Mobile' },
            { width: 768, name: 'Tablette' },
            { width: 1024, name: 'Desktop' }
        ];

        for (const bp of breakpoints) {
            try {
                // Simuler la taille d'écran
                window.innerWidth = bp.width;
                window.dispatchEvent(new Event('resize'));

                // Vérifier les classes CSS
                const sidebar = document.querySelector('.sidebar');
                const mainContent = document.querySelector('.main-content');
                
                if (bp.width <= 768) {
                    this.assertTest(
                        `Responsive ${bp.name}`,
                        sidebar.classList.contains('mobile') && 
                        mainContent.classList.contains('mobile')
                    );
                } else {
                    this.assertTest(
                        `Responsive ${bp.name}`,
                        !sidebar.classList.contains('mobile') && 
                        !mainContent.classList.contains('mobile')
                    );
                }
            } catch (error) {
                this.assertTest(`Responsive ${bp.name}`, false, error.message);
            }
        }
    }

    /**
     * Test du fallback Ollama
     */
    async testOllamaFallback() {
        console.log('\n🔄 Test du fallback Ollama...');

        try {
            // Simuler une erreur Ollama
            this.ollamaService.isAvailable = false;

            // Tenter une génération
            const result = await this.ollamaService.generateComment({
                name: 'Test Élève',
                level: 'CP',
                evaluations: []
            });

            // Vérifier que le fallback a fonctionné
            this.assertTest(
                'Fallback Ollama',
                result && result.includes('Test Élève') && 
                result.includes('CP')
            );

            // Restaurer l'état normal
            this.ollamaService.isAvailable = true;
        } catch (error) {
            this.assertTest('Fallback Ollama', false, error.message);
        }
    }

    /**
     * Assertion de test
     */
    assertTest(name, condition, error = null) {
        this.testResults.total++;
        
        if (condition) {
            this.testResults.passed++;
            console.log(`✅ ${name}: PASSED`);
        } else {
            this.testResults.failed++;
            console.log(`❌ ${name}: FAILED${error ? ` - ${error}` : ''}`);
        }
    }

    /**
     * Affichage des résultats
     */
    displayResults() {
        console.log('\n📊 Résultats des tests:');
        console.log(`Total: ${this.testResults.total}`);
        console.log(`Passés: ${this.testResults.passed}`);
        console.log(`Échoués: ${this.testResults.failed}`);
        console.log(`Taux de réussite: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    }
}

// Exécuter les tests
const tests = new LSUTests();
tests.runAllTests(); 