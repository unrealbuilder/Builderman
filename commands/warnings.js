import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const warningsFile = path.join('./data', 'warnings.json');

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('Check warnings of a member')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('Member to check')
      .setRequired(true));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');

  if (!fs.existsSync(warningsFile)) {
    return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
  }

  const warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8'))[user.id] || [];

  if (!warnings.length) {
    return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
  }

  const formatted = warnings.map((w, i) => `**${i + 1}.** ${w.reason} (on ${new Date(w.date).toLocaleString()})`).join('\n');

  await interaction.reply({ content: `Warnings for ${user.tag}:\n${formatted}`, ephemeral: true });
}
