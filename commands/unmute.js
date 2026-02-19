// commands/unmute.js
import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Unmutes a user in this server.')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user to unmute')
      .setRequired(true));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');

  try {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return await interaction.reply({ content: '❌ You do not have permission to unmute members.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);
    const muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');

    if (!muteRole || !member.roles.cache.has(muteRole.id)) {
      return await interaction.reply({ content: `❌ <@${user.id}> is not muted.`, ephemeral: true });
    }

    // Remove the Muted role
    await member.roles.remove(muteRole, `Unmuted by ${interaction.user.tag}`);

    await interaction.reply({ content: `✅ <@${user.id}> has been unmuted.` });

  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Failed to unmute the user. Check my permissions.', ephemeral: true });
  }
}
