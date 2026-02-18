import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Shows bot latency.');

export async function execute(client, interaction) {
  try {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    await interaction.editReply(`🏓 Pong! Latency is ${sent.createdTimestamp - interaction.createdTimestamp}ms.`);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}
