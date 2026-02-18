// index.js - updated Discord bot (CommonJS)

// Load local .env (for local dev). In production (Railway) you don't need a .env file.
require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const pkg = require('./package.json'); // used for version/name in the info command

// Config / constants
const PREFIX = '!';
const CREATOR = 'Builderman#7813'; // change if you want
const TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error('ERROR: DISCORD_TOKEN is not set. Set it in .env locally or in Railway environment variables.');
  process.exit(1);
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,    // welcome / leave events
    GatewayIntentBits.GuildMessages,   // messageCreate
    GatewayIntentBits.MessageContent   // read message content for commands
  ]
});

// --- Bot ready ---
client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
  try {
    client.user.setActivity('Helping servers build'); // optional presence
  } catch (err) {
    // ignore presence errors if not allowed
  }
});

// --- Message / Command handler ---
client.on('messageCreate', async (message) => {
  try {
    if (message.author?.bot) return; // ignore bots

    const text = message.content?.trim();
    if (!text || !text.startsWith(PREFIX)) return;

    const args = text.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // !hello
    if (command === 'hello') {
      await message.reply(`Hello, ${message.author.username}! 👋`);
      return;
    }

    // !ping - measures round trip using a temporary message
    if (command === 'ping') {
      const sent = await message.reply('Pinging…');
      await sent.edit(`Pong! 🏓 Latency is ${sent.createdTimestamp - message.createdTimestamp}ms`);
      return;
    }

    // !info - embed with bot info
    if (command === 'info') {
      const embed = new EmbedBuilder()
        .setTitle('Bot Information')
        .setColor(0x00AE86)
        .addFields(
          { name: 'Name', value: client.user.username, inline: true },
          { name: 'Version', value: pkg.version || '1.0.0', inline: true },
          { name: 'Creator', value: CREATOR, inline: true }
        )
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
      return;
    }

    // Unknown command handler (simple)
    await message.reply('Unknown command. Try `!hello`, `!ping`, or `!info`.');
  } catch (err) {
    console.error('Error handling messageCreate:', err);
    // Don't crash — let the user know something went wrong
    try { message.reply('Something went wrong while processing the command.'); } catch (e) {}
  }
});

// --- Welcome / Farewell events ---
client.on('guildMemberAdd', (member) => {
  try {
    const channel = member.guild.systemChannel;
    if (!channel) return; // if no system channel, skip
    channel.send(`Welcome to ${member.guild.name}, ${member.user}! 🎉`);
  } catch (err) {
    console.error('guildMemberAdd handler error:', err);
  }
});

client.on('guildMemberRemove', (member) => {
  try {
    const channel = member.guild.systemChannel;
    if (!channel) return;
    channel.send(`${member.user.tag} has left the server.`);
  } catch (err) {
    console.error('guildMemberRemove handler error:', err);
  }
});

// --- Global error handling (safe logging) ---
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// --- Express heartbeat for Railway / uptime services ---
const app = express();
app.get('/ping', (req, res) => {
  // useful to keep the app awake with an uptime monitor
  console.log('Received /ping');
  res.status(200).send('Pong');
});
app.listen(PORT, () => {
  console.log(`Heartbeat server listening on port ${PORT}`);
});

// --- Graceful shutdown ---
async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  try {
    await client.destroy();
  } catch (err) {
    console.warn('Error during client.destroy()', err);
  }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// --- Login ---
client.login(TOKEN).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
