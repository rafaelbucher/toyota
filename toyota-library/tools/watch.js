const chokidar = require('chokidar');
const { exec } = require('child_process');

console.log('👀 Surveillance des fichiers CSS...');

chokidar.watch('src/**/*.css').on('change', () => {
  console.log('🔄 Fichier modifié, rebuild...');
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    console.log(stdout);
  });
});