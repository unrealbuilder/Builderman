import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Information about this server.');

export async function execute(client, interaction) {
  const guild = interaction.guild;
  interaction.reply(`**Server Info:**\n- Name: ${guild.name}\n- ID: ${guild.id}\n- Members: ${guild.memberCount}\n- Channels: ${guild.channels.cache.size}`);
}
