import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user from the server.')
  .addStringOption(option =>
    option.setName('userid')
      .setDescription('The ID of the user to unban')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for the unban')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('public')
      .setDescription('Announce the unban publicly with a hammer animation')
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Channel to announce the public unban in')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  );

export async function execute(interaction) {
  // Moderator check
  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({ content: '❌ You do not have permission to unban members.', ephemeral: true });
  }

  const userId = interaction.options.getString('userid');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const isPublic = interaction.options.getBoolean('public') || false;
  const announceChannel = interaction.options.getChannel('channel');

  try {
    const bans = await interaction.guild.bans.fetch();
    const bannedUser = bans.get(userId);

    if (!bannedUser) {
      return interaction.reply({ content: '❌ This user is not banned.', ephemeral: true });
    }

    // Public announcement
    if (isPublic && announceChannel) {
      const frames = [
        '🛠️      Preparing the banhammer...',
        '🛠️ <-    Reversing swing...',
        '🛠️ <==   Almost free...',
        '🛠️ <===  Freedom incoming!',
        '💥🛠️     BAM! Unbanned!'
      ];

      const embed = new EmbedBuilder()
        .setTitle('⚒️ Unbanhammer Incoming! ⚒️')
        .setColor(0x00FF00)
        .setTimestamp();

      const message = await announceChannel.send({ embeds: [embed] });
      await interaction.reply({ content: `🚨 Public unban countdown started for ${bannedUser.user.tag}`, ephemeral: true });

      for (const frame of frames) {
        embed.setDescription(`${frame}\nTarget: ${bannedUser.user.tag}`);
        await message.edit({ embeds: [embed] });
        await new Promise(r => setTimeout(r, 1000));
      }

      embed.setTitle('💥 Banhammer Reversed!')
        .setDescription(`🛠️ ${bannedUser.user.tag} has been unbanned!\nReason: ${reason}`)
        .setColor(0x00FF00);

      await message.edit({ embeds: [embed] });
    } else {
      await interaction.reply({ content: `✅ ${bannedUser.user.tag} has been unbanned.\nReason: ${reason}`, ephemeral: true });
    }

    await interaction.guild.members.unban(userId, reason);

  } catch (err) {
    console.error(err);
    return interaction.reply({ content: '❌ Failed to unban the user. Check the ID or permissions.', ephemeral: true });
  }
}
