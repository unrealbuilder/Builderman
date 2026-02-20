import { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } from 'discord.js';

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

  // Check permissions
  if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    return interaction.reply({ content: '❌ You need moderator permissions.', ephemeral: true });
  }

  // Fetch target member
  const targetUser = interaction.options.getUser('target');
  const target = interaction.guild.members.cache.get(targetUser.id)
               || await interaction.guild.members.fetch(targetUser.id).catch(() => null);
  if (!target) return interaction.reply({ content: '❌ Cannot find that user.', ephemeral: true });

  // Remove timeout
  await target.timeout(null);

  // Embed
  const embed = new EmbedBuilder()
    .setTitle('🔊 User Unmuted')
    .setColor(0x00FF00)
    .setDescription(`**Target:** ${target.user.tag}`)
    .setTimestamp();

  const isPublic = interaction.options.getBoolean('public');
  const announceChannel = interaction.options.getChannel('channel');

  if (isPublic && announceChannel) {
    await announceChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ ${target.user.tag} has been unmuted publicly.`, ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
