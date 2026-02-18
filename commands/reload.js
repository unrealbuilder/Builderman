// commands/reload.js
import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

export const data = new SlashCommandBuilder()
  .setName('reload')
  .setDescription('Reloads a command dynamically.')
  .addStringOption(option =>
    option
      .setName('command')
      .setDescription('The command name to reload')
      .setRequired(true)
  );

export async function execute(client, interaction) {
  const commandName = interaction.options.getString('command').toLowerCase();
  const commandPath = path.resolve('./commands', `${commandName}.js`);

  try {
    if (!fs.existsSync(commandPath)) {
      return await interaction.reply({ content: `❌ Command "${commandName}" does not exist.`, ephemeral: true });
    }

    // Delete cached module
    const fileUrl = `file://${commandPath}`;
    delete client.commands.get(commandName);
    await import(`${fileUrl}?update=${Date.now()}`); // Force ESM reload

    // Reload into client.commands
    const command = await import(fileUrl);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      await interaction.reply({ content: `✅ Command "${commandName}" reloaded successfully.` });
    } else {
      await interaction.reply({ content: `⚠️ "${commandName}" is missing data or execute after reload.`, ephemeral: true });
    }
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: `❌ Failed to reload "${commandName}".`, ephemeral: true });
  }
}
