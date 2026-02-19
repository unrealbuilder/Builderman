import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('View warnings for a user.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to view warnings for')
      .setRequired(true)
  );

export async function execute(interaction) {
  const target = interaction.options.getUser('target');

  // Fetch warnings from your database
  // Example: const userWarnings = warningsDB.getWarnings(target.id) || [];

  const userWarnings = [
    { reason: 'Spamming', date: '2026-02-19' },
    { reason: 'Harassment', date: '2026-02-15' }
  ]; // Example data

  const embed = new EmbedBuilder()
    .setTitle(`⚠️ Warnings for ${target.tag}`)
    .setColor(0xFFA500)
    .setTimestamp()
    .setDescription(userWarnings.length
      ? userWarnings.map((w, i) => `${i+1}. ${w.reason} - ${w.date}`).join('\n')
      : 'No warnings found.');

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
