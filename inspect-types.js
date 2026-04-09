const fs = require('fs');
const path = require('path');

const dirsToSearch = [
  path.join(__dirname, 'node_modules', 'react-pageflip'),
  path.join(__dirname, 'node_modules', 'page-flip')
];

const keywords = ['vertical', 'orientation', 'direction'];

function searchFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            searchFiles(filePath);
        } else if (filePath.endsWith('.d.ts') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            keywords.forEach(keyword => {
                if (content.toLowerCase().includes(keyword.toLowerCase())) {
                    console.log(`Found "${keyword}" in ${filePath.replace(__dirname, '')}`);
                    const lines = content.split('\n');
                    lines.forEach((line, index) => {
                        if (line.toLowerCase().includes(keyword.toLowerCase())) {
                            console.log(`  Line ${index + 1}: ${line.trim()}`);
                        }
                    });
                }
            });
        }
    }
}

dirsToSearch.forEach(dir => {
    console.log(`\nSearching in ${dir}...`);
    searchFiles(dir);
});
