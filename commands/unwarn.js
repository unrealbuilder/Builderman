import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const warningsFile = path.join('./data', 'warnings.json');

export const data = new SlashCommandBuilder()
  .setName('unwarn')
  .setDescription('Remove a warning from a member')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('Member to remove a warning from')
      .setRequired(true))
  .addIntegerOption(option => 
    option.setName('index')
      .setDescription('Warning number to remove (default: last)'));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');
  const index = interaction.options.getInteger('index');

  if (!fs.existsSync(warningsFile)) {
    return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
  }

  const warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
  const userWarnings = warnings[user.id] || [];

  if (!userWarnings.length) {
    return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
  }

  let removed;
  if (index && index > 0 && index <= userWarnings.length) {
    removed = userWarnings.splice(index - 1, 1)[0];
  } else {
    removed = userWarnings.pop(); // remove last warning
  }

  warnings[user.id] = userWarnings;
  fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

  await interaction.reply({ content: `✅ Removed warning${index ? ` #${index}` : ''} from ${user.tag}: "${removed.reason}"`, ephemeral: true });
}
