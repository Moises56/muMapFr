const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'node_modules', 'leaflet', 'dist', 'images');
const targetDir = path.join(__dirname, 'src', 'assets', 'leaflet', 'images');

// Crear el directorio de destino si no existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copiar los archivos
const files = [
  'marker-icon.png',
  'marker-icon-2x.png',
  'marker-shadow.png',
  'layers.png',
  'layers-2x.png'
];

files.forEach(file => {
  fs.copyFileSync(
    path.join(sourceDir, file),
    path.join(targetDir, file)
  );
  console.log(`Copiado ${file}`);
}); 