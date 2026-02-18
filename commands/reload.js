import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const data = new SlashCommandBuilder()
  .setName('reload')
  .setDescription('Reloads all bot commands (owner only).');

export async function execute(client, interaction) {
  const OWNER_ID = process.env.OWNER_ID;
  
  // Permission check
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
  }

  const commandsPath = path.join(__dirname);
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js') && f !== 'reload.js');

  let reloaded = [];
  let failed = [];

  for (const file of commandFiles) {
    try {
      // Remove from cache
      const fullPath = path.join(commandsPath, file);
      delete await import.meta.resolve(fullPath);
      
      // Import fresh
      const { data, execute } = await import(`${fullPath}?update=${Date.now()}`);
      if (!data || !execute) throw new Error('Invalid command structure');

      // Update the client collection
      client.commands.set(data.name, { data, execute });
      reloaded.push(file);
    } catch (err) {
      console.error(`Failed to reload ${file}:`, err);
      failed.push(file);
    }
  }

  let replyMsg = '';
  if (reloaded.length) replyMsg += `✅ Reloaded: ${reloaded.join(', ')}\n`;
  if (failed.length) replyMsg += `❌ Failed: ${failed.join(', ')}`;

  await interaction.reply({ content: replyMsg || 'Nothing reloaded.', ephemeral: true });
}
