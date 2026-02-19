import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const warningsFile = path.join('./data', 'warnings.json');

// Ensure the warnings folder/file exists
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(warningsFile)) fs.writeFileSync(warningsFile, '{}');

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a member')
  .addUserOption(option => option.setName('user').setDescription('The member to warn').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for warning').setRequired(false));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  const warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));

  if (!warnings[user.id]) warnings[user.id] = [];
  warnings[user.id].push({ reason, moderator: interaction.user.tag, date: new Date().toISOString() });

  fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

  await interaction.reply({ content: `⚠️ ${user.tag} has been warned.\nReason: ${reason}`, ephemeral: false });
}
