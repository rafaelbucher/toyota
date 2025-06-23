const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../index.ejs');
const outputPath = path.join(__dirname, '../index.html');

ejs.renderFile(templatePath, {}, {}, (err, str) => {
  if (err) throw err;
  fs.writeFileSync(outputPath, str);
  console.log('index.html généré avec EJS !');
});