import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kicks a member from the server.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The member to kick')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for the kick')
      .setRequired(false));

export async function execute(client, interaction) {
  try {
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({ content: 'You do not have permission to kick members.', ephemeral: true });
    }
    if (!member.kickable) {
      return interaction.reply({ content: 'I cannot kick this member.', ephemeral: true });
    }

    await member.kick(reason);
    await interaction.reply({ content: `${member.user.tag} has been kicked. Reason: ${reason}` });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Failed to kick the member.', ephemeral: true });
  }
}
