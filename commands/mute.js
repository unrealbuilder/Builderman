// commands/mute.js
import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Mutes a user in this server.')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to mute')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for muting')
      .setRequired(false)
  );

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  
  try {
    // Check if the command user has permission
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return await interaction.reply({ content: '❌ You do not have permission to mute members.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    // Find or create a "Muted" role
    let muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole) {
      muteRole = await interaction.guild.roles.create({
        name: 'Muted',
        color: 'GRAY',
        permissions: []
      });

      // Deny sending messages in all channels
      for (const [channelId, channel] of interaction.guild.channels.cache) {
        await channel.permissionOverwrites.create(muteRole, {
          SendMessages: false,
          AddReactions: false,
          Speak: false
        });
      }
    }

    // Add the role
    if (member.roles.cache.has(muteRole.id)) {
      return await interaction.reply({ content: `❌ <@${user.id}> is already muted.`, ephemeral: true });
    }

    await member.roles.add(muteRole, `Muted by ${interaction.user.tag} | Reason: ${reason}`);
    await interaction.reply({ content: `✅ <@${user.id}> has been muted. Reason: ${reason}` });

  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Failed to mute the user. Check my permissions.', ephemeral: true });
  }
}
