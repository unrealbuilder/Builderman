import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

// --------------------
// CLIENT SETUP
// --------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // for slash commands
    GatewayIntentBits.GuildMessages,    // to read messages
    GatewayIntentBits.MessageContent,   // needed for messageCreate events
    GatewayIntentBits.GuildMembers      // needed for mute/unmute
  ]
});

client.commands = new Collection();

// --------------------
// LOAD COMMANDS
// --------------------
const commandsPath = path.resolve('./commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const command = await import(`file://${path.join(commandsPath, file)}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name} (${file})`);
    } else {
      console.log(`⚠️ Skipped ${file}: missing 'data' or 'execute'`);
    }
  } catch (err) {
    console.log(`❌ Error loading ${file}:`, err);
  }
}

// --------------------
// SLASH COMMAND HANDLER
// --------------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(client, interaction);
  } catch (err) {
    console.error(`❌ Error executing ${interaction.commandName}:`, err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
    }
  }
});

// --------------------
// MESSAGE CREATE EVENT (for muted users DM warning)
// --------------------
import messageCreateEvent from './events/messageCreate.js';
client.on('messageCreate', (message) => messageCreateEvent(client, message));

// --------------------
// READY
// --------------------
client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
});

// --------------------
// LOGIN
// --------------------
client.login(process.env.DISCORD_TOKEN);
