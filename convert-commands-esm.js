import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsDir = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsDir)) {
  console.error('Commands folder not found:', commandsDir);
  process.exit(1);
}

const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(commandsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace `module.exports = {...}` with `export default {...}`
  if (content.includes('module.exports')) {
    content = content.replace(/module\.exports\s*=\s*{/, 'export default {');
    console.log(`Converted: ${file}`);
    fs.writeFileSync(filePath, content, 'utf-8');
  } else {
    console.log(`Skipped (already ESM?): ${file}`);
  }
});

console.log('All command files processed.');
