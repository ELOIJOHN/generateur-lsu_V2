const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des icônes manquantes...');

// Créer le dossier d'icônes s'il n'existe pas
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Dossier assets/icons/ créé');
}

// Template SVG optimisé pour conversion PNG
const createSVGIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Fond avec coins arrondis -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bgGrad)" filter="url(#shadow)"/>
  
  <!-- Livre principal -->
  <rect x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.375}" rx="${size * 0.03}" fill="white" opacity="0.95"/>
  <rect x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.0625}" rx="${size * 0.03}" fill="white"/>
  
  <!-- Lignes de texte -->
  <line x1="${size * 0.3125}" y1="${size * 0.375}" x2="${size * 0.6875}" y2="${size * 0.375}" stroke="#4f46e5" stroke-width="${size * 0.006}" opacity="0.7"/>
  <line x1="${size * 0.3125}" y1="${size * 0.4215}" x2="${size * 0.625}" y2="${size * 0.4215}" stroke="#4f46e5" stroke-width="${size * 0.006}" opacity="0.5"/>
  <line x1="${size * 0.3125}" y1="${size * 0.46875}" x2="${size * 0.6875}" y2="${size * 0.46875}" stroke="#4f46e5" stroke-width="${size * 0.006}" opacity="0.7"/>
  <line x1="${size * 0.3125}" y1="${size * 0.515625}" x2="${size * 0.5625}" y2="${size * 0.515625}" stroke="#4f46e5" stroke-width="${size * 0.006}" opacity="0.5"/>
  
  <!-- Stylo/IA -->
  <circle cx="${size * 0.75}" cy="${size * 0.75}" r="${size * 0.09375}" fill="white" opacity="0.9"/>
  <rect x="${size * 0.71875}" y="${size * 0.71875}" width="${size * 0.0625}" height="${size * 0.0078}" rx="${size * 0.004}" fill="#f59e0b"/>
  <rect x="${size * 0.734375}" y="${size * 0.7265625}" width="${size * 0.03125}" height="${size * 0.046875}" rx="${size * 0.015625}" fill="#374151"/>
  
  <!-- Texte LSU -->
  <text x="${size * 0.5}" y="${size * 0.82}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.07}" font-weight="bold">LSU</text>
</svg>`;

// Créer les SVG pour les tailles manquantes
const requiredSizes = [144, 192, 512];

requiredSizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const svgPath = path.join(iconsDir, `icon-${size}.svg`);
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ Créé icon-${size}.svg`);
});

// Créer un script HTML pour convertir SVG en PNG via Canvas
const canvasConverterHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Convertisseur SVG vers PNG</title>
</head>
<body>
    <h2>🎨 Conversion SVG → PNG en cours...</h2>
    <div id="status"></div>
    <canvas id="canvas" style="display: none;"></canvas>
    
    <script>
        const sizes = [144, 192, 512];
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('status');
        
        async function convertSVGtoPNG(size) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = function() {
                    canvas.width = size;
                    canvas.height = size;
                    ctx.clearRect(0, 0, size, size);
                    ctx.drawImage(img, 0, 0, size, size);
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `icon-${size}x${size}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve();
                    }, 'image/png');
                };
                img.onerror = reject;
                const svgBlob = new Blob([${svgContent}]);
                const svgUrl = URL.createObjectURL(svgBlob);
                img.src = svgUrl;
            });
        }

        async function convertAllSVGs() {
            status.textContent = 'Initialisation...';
            try {
                const promises = sizes.map(size => convertSVGtoPNG(size));
                const results = await Promise.all(promises);
                status.textContent = 'Conversion terminée avec succès!';
            } catch (error) {
                status.textContent = 'Erreur lors de la conversion: ' + error.message;
            }
        }

        convertAllSVGs();
    </script>
</body>
</html>`; 