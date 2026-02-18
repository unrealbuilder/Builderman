import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Restarts the bot (owner only)'),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({ content: 'Not allowed.', ephemeral: true });
    }

    await interaction.reply('Restarting...');
    process.exit(0);
  },
};
