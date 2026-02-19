import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Make the bot say something.')
  .addStringOption(option =>
    option.setName('message')
          .setDescription('The message to say')
          .setRequired(true)
  );

const cooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Moderator check
  if (!interaction.member.permissions.has('ManageMessages')) {
    return interaction.reply({ content: '❌ You must be a moderator to use this command.', ephemeral: true });
  }

  // Cooldown check
  if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
    if (Date.now() < expirationTime) {
      const timeLeft = Math.ceil((expirationTime - Date.now()) / 1000);
      return interaction.reply({ content: `⏳ Wait ${timeLeft}s before using this command again.`, ephemeral: true });
    }
  }

  // Execute command
  const message = interaction.options.getString('message');
  await interaction.reply({ content: message });

  // Set cooldown
  cooldowns.set(userId, Date.now());
}
