import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user from the server.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The user to ban')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for the ban')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('public')
      .setDescription('Announce the ban publicly with a hammer animation')
      .setRequired(false)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Channel to announce the public ban in')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  );

export async function execute(interaction) {
  // Moderator check
  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
  }

  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const isPublic = interaction.options.getBoolean('public') || false;
  const announceChannel = interaction.options.getChannel('channel');

  // Cannot ban yourself or the bot
  if (target.id === interaction.user.id || target.id === interaction.client.user.id) {
    return interaction.reply({ content: '❌ Invalid target.', ephemeral: true });
  }

  // Public execution
  if (isPublic && announceChannel) {
    const frames = [
      '🛠️      Preparing...',
      '🛠️ ->    Swinging...',
      '🛠️ ==>   Almost there...',
      '🛠️ ===>  Critical hit!',
      '💥🛠️     BAM! Strike!'
    ];

    const embed = new EmbedBuilder()
      .setTitle('⚒️ Banhammer Incoming! ⚒️')
      .setColor(0xFFA500)
      .setTimestamp();

    const message = await announceChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `🚨 Public execution countdown started for ${target.tag}`, ephemeral: true });

    for (const frame of frames) {
      embed.setDescription(`${frame}\nTarget: ${target.tag}`);
      await message.edit({ embeds: [embed] });
      await new Promise(r => setTimeout(r, 1000));
    }

    embed.setTitle('💥 Banhammer Strikes!')
      .setDescription(`🛠️ ${target.tag} has been slammed by the banhammer!\nReason: ${reason}`)
      .setColor(0xFF0000);

    await message.edit({ embeds: [embed] });
  } else {
    await interaction.reply({ content: `✅ ${target.tag} will be banned. Reason: ${reason}`, ephemeral: true });
  }

  // Ban the user
  const member = await interaction.guild.members.fetch(target.id);
  await member.ban({ reason });
}
