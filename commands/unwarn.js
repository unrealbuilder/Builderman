import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unwarn')
  .setDescription('Remove a warning from a user.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to remove warning from')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for removing the warning')
      .setRequired(false)
  );

export async function execute(interaction) {
  const member = interaction.member;
  if (!member.permissions.has('ModerateMembers')) return interaction.reply({ content: '❌ You need moderator permissions.', ephemeral: true });

  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  // Implement your warnings storage logic here
  // Example: warningsDB.removeWarning(target.id);

  const embed = new EmbedBuilder()
    .setTitle('⚠️ Warning Removed')
    .setDescription(`${target.tag} has had a warning removed.\nReason: ${reason}`)
    .setColor(0x00FF00)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
