import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Make the bot say something in the channel')
  .addStringOption(option =>
    option
      .setName('message')
      .setDescription('The message for the bot to say')
      .setRequired(true)
  );

export async function execute(client, interaction) {
  const message = interaction.options.getString('message');

  try {
    await interaction.reply({ content: message });
  } catch (err) {
    console.error('Error in /say command:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Failed to send the message.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Failed to send the message.', ephemeral: true });
    }
  }
}
