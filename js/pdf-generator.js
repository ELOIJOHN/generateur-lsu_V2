/**
 * ===================================
 * PDF GENERATOR SERVICE
 * js/pdf-generator.js
 * ===================================
 * 
 * Service de génération de PDF
 * - Génération de bulletins
 * - Mise en page personnalisée
 * - Export de données
 * - Gestion des styles
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

class PDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.fontSize = {
            title: 16,
            subtitle: 14,
            normal: 12,
            small: 10
        };
    }

    /**
     * Initialise un nouveau document PDF
     */
    initDocument() {
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        this.setupFonts();
    }

    /**
     * Configure les polices
     */
    setupFonts() {
        this.doc.setFont('helvetica');
        this.doc.setFontSize(this.fontSize.normal);
    }

    /**
     * Génère un bulletin scolaire
     */
    generateReportCard(student, evaluations, period) {
        this.initDocument();
        
        // En-tête
        this.addHeader(student, period);
        
        // Informations de l'élève
        this.addStudentInfo(student);
        
        // Évaluations
        this.addEvaluations(evaluations);
        
        // Appréciations
        this.addComments(evaluations);
        
        // Signature
        this.addSignature();
        
        return this.doc;
    }

    /**
     * Ajoute l'en-tête du bulletin
     */
    addHeader(student, period) {
        // Logo de l'école
        // this.doc.addImage(logo, 'PNG', this.margin, this.margin, 30, 30);
        
        // Titre
        this.doc.setFontSize(this.fontSize.title);
        this.doc.text('BULLETIN SCOLAIRE', this.pageWidth / 2, this.margin + 10, { align: 'center' });
        
        // Sous-titre
        this.doc.setFontSize(this.fontSize.subtitle);
        this.doc.text(`${period} - ${student.level}`, this.pageWidth / 2, this.margin + 20, { align: 'center' });
        
        // Ligne de séparation
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.margin + 25, this.pageWidth - this.margin, this.margin + 25);
    }

    /**
     * Ajoute les informations de l'élève
     */
    addStudentInfo(student) {
        const y = this.margin + 35;
        
        this.doc.setFontSize(this.fontSize.normal);
        this.doc.text(`Élève : ${student.name}`, this.margin, y);
        this.doc.text(`Classe : ${student.level}`, this.margin, y + 7);
        this.doc.text(`Année scolaire : ${student.schoolYear}`, this.margin, y + 14);
    }

    /**
     * Ajoute les évaluations
     */
    addEvaluations(evaluations) {
        const y = this.margin + 60;
        
        // En-tête du tableau
        const headers = [['Matière', 'Note', 'Appréciation']];
        
        // Données du tableau
        const data = evaluations.map(eval => [
            eval.subject,
            `${eval.score}/20`,
            this.getPerformanceText(eval.score)
        ]);
        
        // Configuration du tableau
        this.doc.autoTable({
            startY: y,
            head: headers,
            body: data,
            theme: 'grid',
            styles: {
                fontSize: this.fontSize.small,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            }
        });
    }

    /**
     * Ajoute les appréciations
     */
    addComments(evaluations) {
        const lastTable = this.doc.lastAutoTable.finalY;
        const y = lastTable + 10;
        
        this.doc.setFontSize(this.fontSize.normal);
        this.doc.text('Appréciations générales :', this.margin, y);
        
        let currentY = y + 7;
        evaluations.forEach(eval => {
            if (eval.comment) {
                const lines = this.doc.splitTextToSize(
                    `${eval.subject} : ${eval.comment}`,
                    this.pageWidth - (2 * this.margin)
                );
                
                this.doc.text(lines, this.margin, currentY);
                currentY += (lines.length * 7);
            }
        });
    }

    /**
     * Ajoute la signature
     */
    addSignature() {
        const y = this.pageHeight - this.margin - 20;
        
        this.doc.setFontSize(this.fontSize.normal);
        this.doc.text('Signature du professeur :', this.margin, y);
        this.doc.text('Signature des parents :', this.pageWidth - this.margin - 60, y);
    }

    /**
     * Obtient le texte de performance
     */
    getPerformanceText(score) {
        if (score >= 16) return 'Excellent';
        if (score >= 14) return 'Très bien';
        if (score >= 12) return 'Bien';
        if (score >= 10) return 'Moyen';
        return 'Insuffisant';
    }

    /**
     * Génère un PDF d'export de données
     */
    generateDataExport(data, title) {
        this.initDocument();
        
        // Titre
        this.doc.setFontSize(this.fontSize.title);
        this.doc.text(title, this.pageWidth / 2, this.margin + 10, { align: 'center' });
        
        // Date
        this.doc.setFontSize(this.fontSize.small);
        const date = new Date().toLocaleDateString('fr-FR');
        this.doc.text(`Export du ${date}`, this.pageWidth / 2, this.margin + 20, { align: 'center' });
        
        // Données
        if (Array.isArray(data)) {
            this.addTableData(data);
        } else {
            this.addObjectData(data);
        }
        
        return this.doc;
    }

    /**
     * Ajoute des données tabulaires
     */
    addTableData(data) {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(header => item[header]));
        
        this.doc.autoTable({
            startY: this.margin + 30,
            head: [headers],
            body: rows,
            theme: 'grid',
            styles: {
                fontSize: this.fontSize.small,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            }
        });
    }

    /**
     * Ajoute des données d'objet
     */
    addObjectData(data) {
        let y = this.margin + 30;
        
        Object.entries(data).forEach(([key, value]) => {
            const text = `${key} : ${value}`;
            const lines = this.doc.splitTextToSize(text, this.pageWidth - (2 * this.margin));
            
            this.doc.text(lines, this.margin, y);
            y += (lines.length * 7);
        });
    }

    /**
     * Sauvegarde le PDF
     */
    save(filename) {
        this.doc.save(filename);
    }
}

// Exporter le service
export default PDFGenerator; 