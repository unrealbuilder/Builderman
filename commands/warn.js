import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const warningsFile = path.join('./data', 'warnings.json');

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Add a warning to a member')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('Member to warn')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('reason')
      .setDescription('Reason for warning')
      .setRequired(true));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  let warnings = {};
  if (fs.existsSync(warningsFile)) {
    warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
  }

  if (!warnings[user.id]) warnings[user.id] = [];
  warnings[user.id].push({ reason, date: new Date().toISOString() });

  fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

  await interaction.reply(`✅ ${user.tag} has been warned for: "${reason}"`);
}
