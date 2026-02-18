// index.js - modular Discord.js v14 bot (CommonJS)
// - command loader
// - cooldowns
// - safe error handling
// - heartbeat /ping
// - graceful shutdown

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const OWNER_ID = process.env.OWNER_ID || null; // for admin commands like reload
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
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  makeCache: undefined,
});

// Collections for commands & cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Load command files
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const cmd = require(path.join(commandsPath, file));
      if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
        console.warn(`Skipping invalid command file: ${file}`);
        continue;
      }
      client.commands.set(cmd.name, cmd);
      // register aliases
      if (Array.isArray(cmd.aliases)) {
        for (const a of cmd.aliases) client.commands.set(a, cmd);
      }
      console.log(`Loaded command: ${cmd.name} (${file})`);
    } catch (err) {
      console.error(`Failed loading command ${file}:`, err);
    }
  }
} else {
  console.warn('No commands folder found. Create ./commands and add command files.');
}

// Ready
client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
  try { client.user.setActivity(PRESENCE); } catch (e) {}
});

// Message handler
client.on('messageCreate', async (message) => {
  try {
    if (!message.guild || message.author.bot) return;
    const content = message.content.trim();
    if (!content.startsWith(PREFIX)) return;

    const args = content.slice(PREFIX.length).trim().split(/\s+/);
    const invoked = args.shift().toLowerCase();
    const command = client.commands.get(invoked);
    if (!command) {
      // optional: silently ignore or inform
      return;
    }

    // Permission check (if command.owner === true)
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

    // Set timestamp and schedule removal
    timestamps.set(message.author.id, now);
    client.cooldowns.set(command.name, timestamps);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Execute
    await command.execute(client, message, args);
  } catch (err) {
    console.error('Error handling messageCreate:', err);
    try { await message.reply('Something went wrong while processing that command.'); } catch (e) {}
  }
});

// Basic guildMember events (welcome/leave)
client.on('guildMemberAdd', (member) => {
  try {
    const ch = member.guild.systemChannel;
    if (ch) ch.send(`Welcome to ${member.guild.name}, ${member.user}! 🎉`);
  } catch (err) { console.error('guildMemberAdd error:', err); }
});
client.on('guildMemberRemove', (member) => {
  try {
    const ch = member.guild.systemChannel;
    if (ch) ch.send(`${member.user.tag} has left the server.`);
  } catch (err) { console.error('guildMemberRemove error:', err); }
});

// Global error handlers
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));

// Heartbeat HTTP server (for Railway / uptime monitor)
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
