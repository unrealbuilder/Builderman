import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Delete multiple messages.')
  .addIntegerOption(option =>
    option.setName('amount')
          .setDescription('Number of messages to delete (max 100)')
          .setRequired(true)
  );

const cooldowns = new Map();
const COOLDOWN_TIME = 15000; // 15 seconds

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Moderator check
  if (!interaction.member.permissions.has('ManageMessages')) {
    return interaction.reply({ content: '❌ You must be a moderator to purge messages.', ephemeral: true });
  }

  // Cooldown check
  if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
    if (Date.now() < expirationTime) {
      const timeLeft = Math.ceil((expirationTime - Date.now()) / 1000);
      return interaction.reply({ content: `⏳ Wait ${timeLeft}s before purging again.`, ephemeral: true });
    }
  }

  const amount = interaction.options.getInteger('amount');
  if (amount < 1 || amount > 100) {
    return interaction.reply({ content: '❌ You can only delete between 1 and 100 messages at a time.', ephemeral: true });
  }

  const messages = await interaction.channel.messages.fetch({ limit: amount });
  await interaction.channel.bulkDelete(messages, true);

  await interaction.reply({ content: `🗑️ Deleted ${messages.size} messages.`, ephemeral: true });

  // Set cooldown
  cooldowns.set(userId, Date.now());
}
