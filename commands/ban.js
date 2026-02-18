import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bans a member from the server.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The member to ban')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for the ban')
      .setRequired(false));

export async function execute(client, interaction) {
  try {
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
    }
    if (!member.bannable) {
      return interaction.reply({ content: 'I cannot ban this member.', ephemeral: true });
    }

    await member.ban({ reason });
    await interaction.reply({ content: `${member.user.tag} has been banned. Reason: ${reason}` });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Failed to ban the member.', ephemeral: true });
  }
}
