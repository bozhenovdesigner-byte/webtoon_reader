const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

console.log('Validating content...');
execFileSync(process.execPath, [path.join(__dirname, 'validate-content.js')], { stdio: 'inherit' });

console.log('Generating data...');
execFileSync(process.execPath, [path.join(__dirname, 'generate-data.js')], { stdio: 'inherit' });

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const copy = (relativePath) => {
    const source = path.join(ROOT, relativePath);
    const target = path.join(DIST, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(source, target, { recursive: true });
};

['index.html', 'pages', 'css', 'js', 'content', 'generated'].forEach(copy);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log('Build complete: dist/');
