import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('hello')
  .setDescription('Says hello!');

export async function execute(client, interaction) {
  try {
    await interaction.reply({ content: `Hello, ${interaction.user.username}! 👋` });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}
