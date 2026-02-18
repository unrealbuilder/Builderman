// commands/unban.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unbans a user from the server.')
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('The ID of the user to unban')
      .setRequired(true)
  );

export async function execute(client, interaction) {
  const userId = interaction.options.getString('userid');

  try {
    // Fetch the ban list
    const bans = await interaction.guild.bans.fetch();
    const bannedUser = bans.get(userId);

    if (!bannedUser) {
      return await interaction.reply({
        content: `❌ User with ID \`${userId}\` is not banned.`,
        ephemeral: true
      });
    }

    // Unban the user
    await interaction.guild.bans.remove(userId, `Unbanned by ${interaction.user.tag}`);

    await interaction.reply({
      content: `✅ Successfully unbanned <@${userId}>!`
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '❌ Failed to unban the user. Make sure the ID is correct and I have proper permissions.',
      ephemeral: true
    });
  }
}
