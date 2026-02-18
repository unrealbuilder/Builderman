import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bans a member from the server.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The user to ban')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for ban')
      .setRequired(false));

export async function execute(client, interaction) {
  const member = interaction.options.getMember('target');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!member) return interaction.reply({ content: 'Member not found.', ephemeral: true });
  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
  }
  if (!member.bannable) {
    return interaction.reply({ content: 'I cannot ban this member.', ephemeral: true });
  }

  await member.ban({ reason });
  await interaction.reply({ content: `${member.user.tag} has been banned. Reason: ${reason}` });
}
