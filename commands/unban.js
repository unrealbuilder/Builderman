import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unbans a user from the server.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The user to unban')
      .setRequired(true));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('target');

  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({ content: 'You do not have permission to unban members.', ephemeral: true });
  }

  try {
    await interaction.guild.bans.remove(user.id);
    await interaction.reply({ content: `${user.tag} has been unbanned.` });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Failed to unban this user.', ephemeral: true });
  }
}
