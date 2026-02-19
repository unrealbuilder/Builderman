import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const warningsFile = path.join('./data', 'warnings.json');

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('View warnings of a member')
  .addUserOption(option => option.setName('user').setDescription('The member to check').setRequired(true));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');

  if (!fs.existsSync(warningsFile)) {
    return interaction.reply({ content: `No warnings found for ${user.tag}.`, ephemeral: true });
  }

  const warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
  const userWarnings = warnings[user.id] || [];

  if (!userWarnings.length) {
    return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
  }

  // Build a neat embed
  const embed = new EmbedBuilder()
    .setTitle(`Warnings for ${user.tag}`)
    .setColor(0xffcc00)
    .setDescription(userWarnings.map((w, i) => 
      `**${i + 1}.** ${w.reason}\n*By ${w.moderator} on ${new Date(w.date).toLocaleString()}*`
    ).join('\n\n'));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
