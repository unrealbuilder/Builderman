// index.js
// Discord bot fully compatible with Railway free hosting
// Commands: !hello, !info, !ping
// Welcome & leave events
// Heartbeat ping endpoint included

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express'); // For heartbeat ping
require('dotenv').config(); // Load .env

// --------- Discord Bot Setup ---------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Required for basic guild info
        GatewayIntentBits.GuildMessages, // Listen to messages
        GatewayIntentBits.MessageContent, // Required to read message content
        GatewayIntentBits.GuildMembers // For welcome/leave events
    ]
});

const token = process.env.DISCORD_TOKEN;

// --------- Bot Events ---------
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const content = message.content.toLowerCase();

    if (content === '!hello') {
        message.channel.send(`Hello, ${message.author.username}!`);
    }

    if (content === '!info') {
        const infoEmbed = new EmbedBuilder()
            .setTitle('Bot Information')
            .setColor(0x00AE86)
            .addFields(
                { name: 'Bot Name', value: client.user.username, inline: true },
                { name: 'Version', value: '1.0.0', inline: true },
                { name: 'Creator', value: 'Builderman#7813', inline: true }
            );
        message.channel.send({ embeds: [infoEmbed] });
    }

    if (content === '!ping') {
        const latency = Date.now() - message.createdTimestamp;
        message.channel.send(`🏓 Latency: ${latency}ms`);
    }
});

// Welcome new members
client.on('guildMemberAdd', (member) => {
    const channel = member.guild.systemChannel; // Default system channel
    if (channel) channel.send(`Welcome to the server, ${member.user.username}! 🎉`);
});

// Farewell when members leave
client.on('guildMemberRemove', (member) => {
    const channel = member.guild.systemChannel;
    if (channel) channel.send(`${member.user.username} has left the server. 😢`);
});

// Handle errors gracefully
client.on('error', console.error);

// --------- Railway Heartbeat Ping ---------
const app = express();
app.get('/ping', (req, res) => {
    console.log('Received heartbeat ping ✅');
    res.send('Pong!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Heartbeat server running on port ${PORT}`));

// --------- Login to Discord ---------
client.login(token);
