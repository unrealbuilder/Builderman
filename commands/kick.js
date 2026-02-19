import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a user from the server (moderator only)')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to kick')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for kick')
      .setRequired(false)
  );

export async function execute(interaction) {
  const member = interaction.member;

  if (!member.permissions.has('KickMembers') && !member.permissions.has('Administrator')) {
    return interaction.reply({ content: '❌ You need kick permissions to use this command.', ephemeral: true });
  }

  const now = Date.now();
  const cooldown = cooldowns.get(member.id) || 0;
  if (now < cooldown) {
    return interaction.reply({ content: `⏳ Cooldown active. Try again in ${Math.ceil((cooldown-now)/1000)}s.`, ephemeral: true });
  }
  cooldowns.set(member.id, now + COOLDOWN_TIME);

  const target = interaction.options.getMember('target');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!target) return interaction.reply({ content: '❌ Cannot find that user.', ephemeral: true });
  if (!target.kickable) return interaction.reply({ content: '❌ I cannot kick this user.', ephemeral: true });

  await target.kick(reason);
  await interaction.reply({ content: `✅ Kicked ${target.user.tag}. Reason: ${reason}`, ephemeral: true });
}
