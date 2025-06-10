const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tailles d'icônes requises
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Créer le dossier assets/icons s'il n'existe pas
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Fonction pour générer les icônes
async function generateIcons() {
    try {
        // Vérifier si l'icône source existe
        const sourceIcon = path.join(__dirname, 'assets', 'icon-source.png');
        if (!fs.existsSync(sourceIcon)) {
            console.error('❌ Icône source non trouvée. Veuillez placer une image icon-source.png dans le dossier assets/');
            return;
        }

        console.log('🎨 Génération des icônes PWA...');

        // Générer chaque taille d'icône
        for (const size of ICON_SIZES) {
            const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
            
            await sharp(sourceIcon)
                .resize(size, size)
                .toFile(outputPath);
            
            console.log(`✅ Icône ${size}x${size} générée`);
        }

        // Générer l'icône pour Apple Touch
        await sharp(sourceIcon)
            .resize(192, 192)
            .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

        console.log('✅ Icône Apple Touch générée');

        // Générer l'icône de badge
        await sharp(sourceIcon)
            .resize(72, 72)
            .toFile(path.join(iconsDir, 'badge-72x72.png'));

        console.log('✅ Badge généré');

        console.log('✨ Génération des icônes terminée !');
    } catch (error) {
        console.error('❌ Erreur lors de la génération des icônes:', error);
    }
}

// Exécuter la génération
generateIcons(); 