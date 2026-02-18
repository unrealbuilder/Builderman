// apply-slash-handler.mjs
// Run from project root: node apply-slash-handler.mjs
// Backs up index.js -> index.js.bak and writes a new ESM index.js ready for slash commands.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

const INDEX_PATH = path.join(ROOT, 'index.js');
const BACKUP_PATH = path.join(ROOT, 'index.js.bak');

if (!fs.existsSync(INDEX_PATH)) {
  console.error('index.js not found in project root:', ROOT);
  process.exit(1);
}

// backup
if (!fs.existsSync(BACKUP_PATH)) {
  fs.copyFileSync(INDEX_PATH, BACKUP_PATH);
  console.log('Backup created at', BACKUP_PATH);
} else {
  const bak2 = BACKUP_PATH + '.' + Date.now();
  fs.copyFileSync(INDEX_PATH, bak2);
  console.log('Backup created at', bak2);
}

// new index.js content (ESM, Node 25+)
const newIndex = `// index.js - Slash-command-ready (ESM, Node 25+)
// Replaced by apply-slash-handler.mjs. Backup of previous file saved as index.js.bak
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = process.env.DISCORD_TOKEN;
const OWNER_ID = process.env.OWNER_ID || null;
const PREFIX = process.env.PREFIX || '!';
const PORT = process.env.PORT || 3000;
const PRESENCE = process.env.PRESENCE || 'Helping servers build';

if (!TOKEN) {
  console.error('FATAL: DISCORD_TOKEN not found in environment. Aborting.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    // Not necessary for slash commands, but keep if you need them:
    GatewayIntentBits.GuildMessages,
  ],
});

// Collections
client.commands = new Collection();
client.cooldowns = new Collection();

// --- Load slash commands (expect command.data and command.execute) ---
const commandsPath = path.join(process.cwd(), 'commands');
if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
  (async () => {
    for (const file of files) {
      const fullPath = path.join(commandsPath, file);
      try {
        const mod = await import(pathToFileURL(fullPath).href);
        const cmd = mod.default ?? mod;
        if (!cmd) {
          console.warn('Skipping', file, '- no export found');
          continue;
        }
        // slash commands must export data (SlashCommandBuilder) and execute(interaction)
        if (!('data' in cmd) || typeof cmd.data?.toJSON !== 'function') {
          console.warn('Skipping', file, '- missing data (SlashCommandBuilder)');
          continue;
        }
        if (!('execute' in cmd) || typeof cmd.execute !== 'function') {
          console.warn('Skipping', file, '- missing execute(interaction)');
          continue;
        }
        const name = cmd.data.name ?? cmd.data?.toJSON?.().name;
        client.commands.set(name, cmd);
        console.log('Loaded command:', name, '(', file, ')');
      } catch (err) {
        console.error('Failed loading command', file, err);
      }
    }
  })();
} else {
  console.warn('No commands folder found at', commandsPath);
}

// --- Interaction handler (slash commands) ---
client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return; // ignore non-chat commands
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      // command not found in collection
      return interaction.reply({ content: 'Command not loaded on this bot instance.', ephemeral: true });
    }

    // Optional: owner-only check if you set ownerOnly on your command objects
    if (command.ownerOnly && String(interaction.user.id) !== String(OWNER_ID)) {
      return interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
    }

    // Cooldown (per command)
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.data.name) || new Collection();
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(interaction.user.id)) {
      const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
      if (now < expiration) {
        const timeLeft = Math.ceil((expiration - now) / 1000);
        return interaction.reply({ content: \`Please wait \${timeLeft}s before using this command again.\`, ephemeral: true });
      }
    }
    timestamps.set(interaction.user.id, now);
    client.cooldowns.set(command.data.name, timestamps);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // Execute
    await command.execute(interaction);
  } catch (err) {
    console.error('Error in interactionCreate:', err);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
      }
    } catch (e) {
      console.error('Failed to send error reply to interaction:', e);
    }
  }
});

/* Optional: keep messageCreate if you want both prefix + slash (commented)
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  // ... old prefix handling (not included) ...
});
*/

// --- Basic guildMember events ---
client.on('guildMemberAdd', (member) => {
  try { member.guild.systemChannel?.send('Welcome to ' + member.guild.name + ', ' + member.user + '! 🎉'); } catch(e) {}
});
client.on('guildMemberRemove', (member) => {
  try { member.guild.systemChannel?.send(member.user.tag + ' has left the server.'); } catch(e) {}
});

// Global error handlers
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

// Heartbeat server
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.get('/ping', (req, res) => res.status(200).send('Pong'));
app.listen(PORT, () => console.log('Heartbeat server listening on port ' + PORT));

// Graceful shutdown
async function shutdown(sig) {
  console.log('Received', sig, 'shutting down...');
  try { await client.destroy(); } catch (err) { console.warn('Error destroying client:', err); }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Login
client.login(TOKEN).then(() => console.log('Logged in as', client.user?.tag)).catch((err) => {
  console.error('Failed to login:', err);
  process.exit(1);
});
`;

// write new index.js
fs.writeFileSync(INDEX_PATH, newIndex, 'utf8');
console.log('Wrote new index.js. Start the bot with: node index.js');
