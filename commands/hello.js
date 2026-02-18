import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Greets the user'),

  async execute(interaction) {
    await interaction.reply(`Hello ${interaction.user.username}! 👋`);
  },
};
