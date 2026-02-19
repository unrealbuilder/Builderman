import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('botinfo')
  .setDescription('Information about the bot.');

export async function execute(client, interaction) {
  const uptime = Math.floor(client.uptime / 1000);
  interaction.reply(`**Bot Info:**\n- Tag: ${client.user.tag}\n- ID: ${client.user.id}\n- Uptime: ${uptime} seconds`);
}
