// Load environment variables from .env
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

// --- CONFIG ---
const TOKEN = process.env.TOKEN; // Read token from .env

// --- CREATE CLIENT ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Required for guild info
        GatewayIntentBits.GuildMessages,    // Required to see messages
        GatewayIntentBits.MessageContent    // Required to read message text
    ]
});

// --- READY EVENT ---
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

// --- MESSAGE HANDLER ---
client.on('messageCreate', async message => {
    if (message.author.bot) return; // Ignore other bots

    const msg = message.content.trim();

    // --- Hello command ---
    if (msg === '!hello') {
        message.reply(`Hello, ${message.author.username}! 👋`);

    // --- Ping command ---
    } else if (msg === '!ping') {
        const sent = await message.reply('Pinging...'); 
        sent.edit(`Pong! 🏓 Latency is ${sent.createdTimestamp - message.createdTimestamp}ms`);

    // --- Info command ---
    } else if (msg === '!info') {
        message.reply(`Bot Name: ${client.user.tag}\nVersion: 1.0.0\nCreator: YourNameHere`);

    // --- Unknown command handler ---
    } else if (msg.startsWith('!')) {
        message.reply("Unknown command. Try !hello, !ping, or !info.");
    }
});

// --- LOGIN ---
client.login(TOKEN);
