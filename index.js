// index.js (improved)
import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// --------------------
// FILE/PROJECT SETUP
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// LOG UNHANDLED ERRORS (important for debugging)
// --------------------
process.on('unhandledRejection', (reason, p) => {
  console.error('💥 Unhandled Rejection at: Promise', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception thrown', err);
});

// --------------------
// CLIENT SETUP
// --------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// --------------------
// LOAD COMMANDS
// --------------------
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
  console.warn('⚠️ commands folder not found. Skipping command load.');
} else {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const module = await import(pathToFileURL(filePath).href);

      // Determine command name robustly:
      // 1) module.data.name (if present), 2) module.data.toJSON().name, 3) filename (without .js)
      let cmdName = undefined;
      if (module.data) {
        if (typeof module.data.name === 'string') cmdName = module.data.name;
        else if (typeof module.data.toJSON === 'function') {
          const json = module.data.toJSON();
          if (json && json.name) cmdName = json.name;
        }
      }
      if (!cmdName) cmdName = path.basename(file, '.js');

      if (module.data && (module.execute || module.default)) {
        client.commands.set(cmdName, module);
        console.log(`✅ Loaded command: ${cmdName} (${file})`);
      } else {
        console.log(`⚠️ Skipped ${file}: missing 'data' or 'execute/default' export`);
      }
    } catch (err) {
      console.error(`❌ Error loading command ${file}:`, err);
    }
  }
}

// --------------------
// LOAD EVENTS
// --------------------
const eventsPath = path.join(__dirname, 'events');

if (!fs.existsSync(eventsPath)) {
  console.warn('⚠️ events folder not found. Skipping event load.');
} else {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const module = await import(pathToFileURL(filePath).href);

      // Accept multiple event shapes:
      // preferred: export const name = 'messageCreate'; export const once = false; export default async function (client, ...args) { ... }
      // or: export const name = 'messageCreate'; export function execute(client, ...args) { ... }
      // fallback: derive name from filename

      const eventName = module.name || module.eventName || path.basename(file, '.js');
      const isOnce = !!module.once;

      const handler =
        // default export function
        (typeof module.default === 'function' ? module.default :
         // named export execute
         (typeof module.execute === 'function' ? module.execute : null)
        );

      if (!handler) {
        console.log(`⚠️ Skipped event ${file}: no default or execute function exported`);
        continue;
      }

      if (isOnce) {
        client.once(eventName, (...args) => handler(client, ...args));
      } else {
        client.on(eventName, (...args) => handler(client, ...args));
      }

      console.log(`✅ Loaded event: ${eventName} (${file})`);
    } catch (err) {
      console.error(`❌ Error loading event ${file}:`, err);
    }
  }
}

// --------------------
// SLASH COMMAND HANDLER
// --------------------
client.on('interactionCreate', async (interaction) => {
  // use isChatInputCommand() if you only want slash (chat input) commands
  if (!interaction.isCommand()) return;

  const commandModule = client.commands.get(interaction.commandName);
  if (!commandModule) return;

  // Prefer module.execute over default
  const executor = commandModule.execute || commandModule.default;
  if (!executor) {
    console.warn(`⚠️ Command ${interaction.commandName} has no executor function.`);
    return;
  }

  try {
    await executor(interaction.client || client, interaction);
  } catch (err) {
    console.error(`❌ Error executing ${interaction.commandName}:`, err);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
      }
    } catch (replyErr) {
      console.error('❌ Failed to send error reply to interaction:', replyErr);
    }
  }
});

// --------------------
// READY
// --------------------
client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
});

// --------------------
// LOGIN
// --------------------
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN not found in environment. Aborting.');
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('❌ Failed to login:', err);
  process.exit(1);
});
