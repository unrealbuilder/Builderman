import { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Unmute a user in the server.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to unmute')
      .setRequired(true)
  )
  .addBooleanOption(option =>
    option.setName('public')
      .setDescription('Announce the unmute publicly')
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Channel to announce the unmute in')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  );

export async function execute(interaction) {
  const member = interaction.member;
  if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({ content: '❌ You need moderator permissions.', ephemeral: true });
  }

  const target = interaction.options.getMember('target');
  const isPublic = interaction.options.getBoolean('public');
  const announceChannel = interaction.options.getChannel('channel');

  if (!target) return interaction.reply({ content: '❌ Cannot find that user.', ephemeral: true });

  // Remove mute/timeout
  await target.timeout(null);

  // Build the embed
  const embed = new EmbedBuilder()
    .setTitle('🔊 User Unmuted')
    .setColor(0x00FF00)
    .setTimestamp()
    .setDescription(`**Target:** ${target.user.tag}`);

  // Send embed publicly if requested
  if (isPublic && announceChannel) {
    await announceChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ ${target.user.tag} has been unmuted and announced in ${announceChannel}.`, ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
