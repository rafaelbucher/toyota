const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

async function buildCSS() {
  // Lire le fichier principal
  const css = fs.readFileSync('src/main.css', 'utf8');
  
  // Traitement avec PostCSS
  const result = await postcss([autoprefixer])
    .process(css, { from: 'src/main.css', to: 'dist/toyota-library.css' });
  console.log('Contenu CSS généré :', result.css); // Ajoute cette ligne

  // Écrire la version normale
  fs.writeFileSync('dist/toyota-library.css', result.css);
  
  // Version minifiée
  const minified = await postcss([autoprefixer, cssnano()])
    .process(css, { from: 'src/main.css', to: 'dist/toyota-library.min.css' });
  
  fs.writeFileSync('dist/toyota-library.min.css', minified.css);
  
  console.log('✅ Build terminé !');
}

buildCSS().catch(console.error);