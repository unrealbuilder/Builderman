import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Mute a user in the server.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to mute')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for mute')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('public')
      .setDescription('Announce the mute publicly')
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Channel to announce the mute in')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  );

export async function execute(interaction) {
  const member = interaction.member;
  if (!member.permissions.has('ModerateMembers')) {
    return interaction.reply({ content: '❌ You need moderator permissions.', ephemeral: true });
  }

  const target = interaction.options.getMember('target');
  if (!target) return interaction.reply({ content: '❌ Cannot find that user.', ephemeral: true });
  if (!target.moderatable) return interaction.reply({ content: '❌ Cannot mute this user.', ephemeral: true });

  const reason = interaction.options.getString('reason') || 'No reason provided';
  const isPublic = interaction.options.getBoolean('public');
  const announceChannel = interaction.options.getChannel('channel');

  await target.timeout(10 * 60 * 1000, reason); // 10 minutes

  const embed = new EmbedBuilder()
    .setTitle('🔇 User Muted')
    .setColor(0xFFA500)
    .setDescription(`**Target:** ${target.user.tag}\n**Reason:** ${reason}`)
    .setTimestamp();

  if (isPublic && announceChannel) {
    await announceChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ ${target.user.tag} has been muted publicly.`, ephemeral: true });
  } else {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
