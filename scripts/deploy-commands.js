// deploy-commands.js
// Usage:
//   node deploy-commands.js                -> prompt, registers global commands
//   node deploy-commands.js --guild ID     -> prompt, registers to guild ID (instant)
//   node deploy-commands.js -y --guild ID  -> no prompt, registers to guild ID
//
// NOTE: This script MUST be run from your project root (where .env, package.json, commands/ live).

import dotenv from 'dotenv';
dotenv.config(); // <--- ensure .env is loaded BEFORE we read process.env

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { REST, Routes } from 'discord.js';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diagnostics (helpful while debugging)
console.log('Running deploy-commands.js from:', process.cwd());
console.log('Loaded .env values present? DISCORD_TOKEN=', !!process.env.DISCORD_TOKEN, ' CLIENT_ID=', !!process.env.CLIENT_ID);

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('ERROR: DISCORD_TOKEN and CLIENT_ID must be set in .env and script must be run from project root.');
  process.exit(1);
}

const argv = process.argv.slice(2);
const skipPrompt = argv.includes('-y') || argv.includes('--yes');

let guildId = null;
const gIdx = argv.findIndex(a => a === '--guild' || a === '-g');
if (gIdx !== -1 && argv[gIdx + 1]) guildId = argv[gIdx + 1];

const commandsPath = path.join(process.cwd(), 'commands'); // use cwd so running from repo root works
if (!fs.existsSync(commandsPath)) {
  console.error('ERROR: commands folder not found at', commandsPath);
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
if (commandFiles.length === 0) {
  console.warn('No .js/.mjs command files found in ./commands');
  process.exit(0);
}

const commands = [];
const loaded = [];

for (const file of commandFiles) {
  try {
    const fullPath = path.join(commandsPath, file);
    const mod = await import(pathToFileURL(fullPath).href);
    const command = mod.default ?? mod;

    if (!command) {
      console.warn(`Skipping ${file}: no export found`);
      continue;
    }
    if (!('data' in command) || typeof command.data?.toJSON !== 'function') {
      console.warn(`Skipping ${file}: missing 'data' (SlashCommandBuilder)`);
      continue;
    }
    if (!('execute' in command) || typeof command.execute !== 'function') {
      console.warn(`Skipping ${file}: missing 'execute' function`);
      continue;
    }

    commands.push(command.data.toJSON());
    loaded.push({ file, name: command.data.name ?? (command.data?.toJSON?.().name ?? '(unknown)') });
  } catch (err) {
    console.error(`Failed loading command ${file}:`, err);
  }
}

if (commands.length === 0) {
  console.error('No valid slash commands to register. Exiting.');
  process.exit(1);
}

// Summary
console.log('\nCommands to register:');
for (const c of loaded) console.log(' -', c.name, `(${c.file})`);
console.log('');
const mode = guildId ? `GUILD ${guildId} (instant)` : 'GLOBAL (may take ~1 hour to appear)';

if (!skipPrompt) {
  const rl = readline.createInterface({ input, output });
  const ans = await rl.question(`Proceed to register ${commands.length} commands to ${mode}? (Y/n) `);
  rl.close();
  const no = ans.trim().toLowerCase();
  if (no === 'n' || no === 'no') {
    console.log('Aborted by user.');
    process.exit(0);
  }
} else {
  console.log('Skipping prompt due to -y/--yes');
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  if (guildId) {
    console.log('Registering to guild', guildId, '...');
    const result = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: commands });
    console.log(`Registered ${result.length} guild commands.`);
  } else {
    console.log('Registering global commands...');
    const result = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`Registered ${result.length} global commands.`);
  }

  console.log('\nDone. If global, changes may take up to 1 hour to appear.');
  process.exit(0);
} catch (err) {
  console.error('Failed to register commands:', err);
  process.exit(1);
}
