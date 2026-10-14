const fs = require('fs');
const path = require('path');

// Теки та файли, які не потрібно читати
const IGNORE_DIRS = ['node_modules', '.git', '.expo', '.vscode', 'assets'];
const IGNORE_FILES = ['package-lock.json', 'project_export.txt', 'export.js'];
const IGNORE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.ttf', '.otf', '.mp4', '.sqlite', '.db'];

const OUTPUT_FILE = 'project_export.txt';
const outputStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w', encoding: 'utf8' });

function processDirectory(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
            if (!IGNORE_DIRS.includes(entry.name)) {
                processDirectory(fullPath);
            }
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            
            if (!IGNORE_FILES.includes(entry.name) && !IGNORE_EXTS.includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    // Отримуємо відносний шлях (наприклад, src/components/App.js)
                    const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
                    
                    outputStream.write('='.repeat(80) + '\n');
                    outputStream.write(`FILE: ${relativePath}\n`);
                    outputStream.write('='.repeat(80) + '\n\n');
                    outputStream.write(content + '\n\n');
                } catch (err) {
                    console.log(`Пропущено: ${fullPath} (Помилка читання)`);
                }
            }
        }
    }
}

console.log('Починаю збір коду проєкту...');
try {
    processDirectory(__dirname);
    outputStream.end();
    console.log(`Успішно! Весь код збережено у файл: ${OUTPUT_FILE}`);
} catch (error) {
    console.error('Сталася критична помилка:', error.message);
}