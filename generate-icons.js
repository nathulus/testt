const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Fonction pour générer une icône
function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fond bleu
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, size, size);

    // Cercle blanc
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Lettre H
    ctx.fillStyle = '#4F46E5';
    ctx.font = `bold ${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', size/2, size/2);

    return canvas.toBuffer('image/png');
}

// Générer les icônes
const sizes = [192, 512];
sizes.forEach(size => {
    const icon = generateIcon(size);
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), icon);
});

// Générer l'icône des révisions
const revisionsIcon = generateIcon(96);
fs.writeFileSync(path.join(iconsDir, 'revisions-96x96.png'), revisionsIcon);

console.log('Icônes générées avec succès !'); 