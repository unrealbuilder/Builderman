import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a user (moderator only)')
  .addUserOption(option => 
    option.setName('target')
      .setDescription('User to warn')
      .setRequired(true)
  )
  .addStringOption(option => 
    option.setName('reason')
      .setDescription('Reason for warning')
      .setRequired(false)
  );

export async function execute(interaction) {
  const member = interaction.member;

  if (!member.permissions.has('ManageMessages') && !member.permissions.has('Administrator')) {
    return interaction.reply({ content: '❌ You need to be a moderator to use this command.', ephemeral: true });
  }

  const now = Date.now();
  const cooldown = cooldowns.get(member.id) || 0;
  if (now < cooldown) {
    return interaction.reply({ content: `⏳ Cooldown active. Try again in ${Math.ceil((cooldown-now)/1000)}s.`, ephemeral: true });
  }
  cooldowns.set(member.id, now + COOLDOWN_TIME);

  const target = interaction.options.getUser('target');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  const embed = new EmbedBuilder()
    .setTitle('⚠️ User Warned')
    .setDescription(`${target.tag} was warned.`)
    .addFields(
      { name: 'Moderator', value: member.user.tag, inline: true },
      { name: 'Reason', value: reason, inline: true }
    )
    .setColor('Orange')
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
