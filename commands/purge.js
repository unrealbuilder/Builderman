import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Delete a number of messages from this channel')
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Number of messages to delete (2-100)')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages); // Only members with Manage Messages

export async function execute(client, interaction) {
  const amount = interaction.options.getInteger('amount');

  if (amount < 2 || amount > 100) {
    return interaction.reply({ content: 'You can only delete between 2 and 100 messages at a time.', ephemeral: true });
  }

  try {
    const messages = await interaction.channel.messages.fetch({ limit: amount });
    await interaction.channel.bulkDelete(messages, true);
    await interaction.reply({ content: `✅ Deleted ${messages.size} messages.`, ephemeral: true });
  } catch (err) {
    console.error('Error purging messages:', err);
    await interaction.reply({ content: '❌ Failed to delete messages. Make sure I have the right permissions.', ephemeral: true });
  }
}
