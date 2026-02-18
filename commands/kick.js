import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kicks a member from the server')
  .addUserOption(option => 
    option.setName('target')
      .setDescription('The member to kick')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for the kick')
      .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers); // only users with kick perms

export async function execute(interaction) {
  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const member = interaction.guild.members.cache.get(target.id);

  if (!member) {
    return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
  }

  if (!member.kickable) {
    return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
  }

  try {
    await member.kick(reason);
    await interaction.reply({ content: `✅ Kicked ${target.tag}. Reason: ${reason}` });
  } catch (error) {
    console.error('Error kicking member:', error);
    await interaction.reply({ content: '❌ Failed to kick the member.', ephemeral: true });
  }
}
