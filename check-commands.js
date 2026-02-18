// check-commands.js
import fs from 'fs';
import path from 'path';

const commandsPath = path.resolve('./commands');
const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

console.log(`Checking ${files.length} command files...\n`);

for (const file of files) {
  const filePath = path.join(commandsPath, file);

  try {
    const command = await import(`file://${filePath}`);
    const hasData = 'data' in command;
    const hasExecute = 'execute' in command;

    if (!hasData && !hasExecute) {
      console.log(`❌ ${file}: MISSING both 'data' and 'execute'`);
    } else if (!hasData) {
      console.log(`⚠️ ${file}: MISSING 'data'`);
    } else if (!hasExecute) {
      console.log(`⚠️ ${file}: MISSING 'execute'`);
    } else {
      console.log(`✅ ${file}: OK`);
    }
  } catch (err) {
    console.log(`❌ ${file}: ERROR loading file`);
    console.error(err);
  }
}

console.log('\nCheck complete.');
