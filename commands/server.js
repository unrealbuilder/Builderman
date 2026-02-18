import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Shows server information'),

  async execute(interaction) {
    await interaction.reply(
      `Server: ${interaction.guild.name}\nMembers: ${interaction.guild.memberCount}`
    );
  },
};
