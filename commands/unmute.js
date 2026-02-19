import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

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
  if (!member.permissions.has('ModerateMembers')) return interaction.reply({ content: '❌ You need moderator permissions.', ephemeral: true });

  const target = interaction.options.getMember('target');
  const isPublic = interaction.options.getBoolean('public');
  const announceChannel = interaction.options.getChannel('channel');

  if (!target) return interaction.reply({ content: '❌ Cannot find that user.', ephemeral: true });

  await target.timeout(null); // Remove timeout

  if (isPublic && announceChannel) {
    const frames = ['🔊 Preparing unmute...', '🔊 Applying...', '🔊 Unmuted!'];
    const embed = new EmbedBuilder().setTitle('🔊 Unmuting User').setColor(0x00FF00).setTimestamp();
    const message = await announceChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `🚨 Public unmute countdown started for ${target.user.tag}`, ephemeral: true });

    for (const frame of frames) {
      embed.setDescription(`${frame}\nTarget: ${target.user.tag}`);
      await message.edit({ embeds: [embed] });
      await new Promise(r => setTimeout(r, 1000));
    }
  } else {
    await interaction.reply({ content: `✅ ${target.user.tag} has been unmuted.`, ephemeral: true });
  }
}
