// index.js - Discord.js v14, Node 25+ ESM
import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url); // for JSON imports if needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const OWNER_ID = process.env.OWNER_ID || null;
const PREFIX = process.env.PREFIX || '!';
const PORT = process.env.PORT || 3000;
const PRESENCE = process.env.PRESENCE || 'Helping servers build';

if (!TOKEN) {
  console.error('FATAL: DISCORD_TOKEN not found in environment. Aborting.');
  process.exit(1);
}

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands dynamically
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    try {
      const filePath = path.join(commandsPath, file);
      const cmdModule = await import(`file://${filePath}`);
      const cmd = cmdModule.default ?? cmdModule;

      if (!cmd?.name || typeof cmd.execute !== 'function') {
        console.warn(`Skipping invalid command file: ${file}`);
        continue;
      }

      client.commands.set(cmd.name, cmd);
      if (Array.isArray(cmd.aliases)) {
        for (const alias of cmd.aliases) client.commands.set(alias, cmd);
      }

      console.log(`Loaded command: ${cmd.name} (${file})`);
    } catch (err) {
      console.error(`Failed loading command ${file}:`, err);
    }
  }
} else {
  console.warn('No commands folder found. Create ./commands and add command files.');
}

// Client ready
client.once('clientReady', () => {
  console.log(`${client.user.tag} is online!`);
  try { client.user.setActivity(PRESENCE); } catch (e) {}
});

// Message handler
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const invoked = args.shift().toLowerCase();
  const command = client.commands.get(invoked);
  if (!command) return;

  // Owner-only check
  if (command.ownerOnly && String(message.author.id) !== String(OWNER_ID)) {
    return message.reply('You are not allowed to use this command.');
  }

  // Cooldown handling
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name) || new Collection();
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expiration = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expiration) {
      const timeLeft = Math.ceil((expiration - now) / 1000);
      return message.reply(`Please wait ${timeLeft}s before using \`${PREFIX}${command.name}\` again.`);
    }
  }

  timestamps.set(message.author.id, now);
  client.cooldowns.set(command.name, timestamps);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try { await command.execute(client, message, args); } 
  catch (err) { 
    console.error('Error executing command:', err);
    message.reply('Something went wrong while processing that command.');
  }
});

// Welcome / leave messages
client.on('guildMemberAdd', (member) => {
  try { member.guild.systemChannel?.send(`Welcome to ${member.guild.name}, ${member.user}! 🎉`); } 
  catch (err) { console.error('guildMemberAdd error:', err); }
});
client.on('guildMemberRemove', (member) => {
  try { member.guild.systemChannel?.send(`${member.user.tag} has left the server.`); } 
  catch (err) { console.error('guildMemberRemove error:', err); }
});

// Global error handling
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

// Heartbeat / ping server
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.get('/ping', (req, res) => res.status(200).send('Pong'));
app.listen(PORT, () => console.log(`Heartbeat server listening on port ${PORT}`));

// Graceful shutdown
async function shutdown(sig) {
  console.log(`Received ${sig}, shutting down...`);
  try { await client.destroy(); } catch (err) { console.warn('Error destroying client:', err); }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Login
client.login(TOKEN).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
