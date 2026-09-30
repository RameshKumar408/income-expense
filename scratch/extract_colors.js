const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'app/createDetail/createdeails.css',
    'app/loginRegister.css',
    'app/globals.css'
];

let allColors = new Set();
const colorRegex = /(#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\b|rgba?\([^)]+\))/g;

// First pass: extract all colors
filesToProcess.forEach(file => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = colorRegex.exec(content)) !== null) {
        allColors.add(match[0].toLowerCase());
    }
});

// Create variable mapping
const varMap = {};
let counter = 1;
allColors.forEach(color => {
    // Generate a name
    let name = '--color-' + counter++;
    // special names for known colors
    if (color === '#ff3034' || color === '#ff3b3f' || color === '#ff4b63' || color === '#e62f33') name = '--color-expense-red';
    if (color === '#2fd06f') name = '--color-income-green';
    if (color === '#030305' || color === '#000000') name = '--color-bg-dark';
    if (color === '#ffffff') name = '--color-text-white';
    if (color === '#151515') name = '--color-card-bg';
    if (color === '#1d4ed8') name = '--color-brand-blue-dark';
    if (color === '#3b82f6') name = '--color-brand-blue-light';
    if (color === '#8b5cf6') name = '--color-brand-purple';
    
    // Check if we already mapped this semantic name to avoid overriding, 
    // but multiple hexes mapping to same name is fine if we intend to unify.
    // If not unifying, we just use unique vars. Let's just generate generic names with color values to be safe.
    let safeName = color.replace(/[^a-z0-9]/gi, '-').replace(/^-|-$/g, '');
    if (color.startsWith('#')) safeName = 'hex-' + color.slice(1);
    if (color.startsWith('rgba')) safeName = 'rgba-' + counter;
    
    varMap[color] = '--color-' + safeName;
});

// Append to globals.css
let rootVars = '\n:root {\n';
for (const [color, varName] of Object.entries(varMap)) {
    rootVars += `    ${varName}: ${color};\n`;
}
rootVars += '}\n';

const globalsPath = 'app/globals.css';
if (fs.existsSync(globalsPath)) {
    fs.appendFileSync(globalsPath, rootVars);
}

// Second pass: replace in files
filesToProcess.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Sort keys by length descending to replace longer rgba strings first
    const sortedColors = Object.keys(varMap).sort((a, b) => b.length - a.length);
    
    sortedColors.forEach(color => {
        const varName = varMap[color];
        // replace color but ensure we don't replace inside a var()
        // we can use a split/join trick or carefully crafted regex
        content = content.split(color).join(`var(${varName})`);
    });
    
    fs.writeFileSync(file, content);
});

console.log('Colors replaced with CSS variables successfully.');
