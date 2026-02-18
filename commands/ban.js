// commands/ban.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bans a user from the server.')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to ban')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for banning')
      .setRequired(false)
  );

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  try {
    // Check if the user is bannable
    const member = await interaction.guild.members.fetch(user.id);
    if (!member.bannable) {
      return await interaction.reply({
        content: `❌ I cannot ban <@${user.id}>. Check my role hierarchy and permissions.`,
        ephemeral: true
      });
    }

    // Ban the member
    await member.ban({ reason: `${reason} (Banned by ${interaction.user.tag})` });

    await interaction.reply({
      content: `✅ Successfully banned <@${user.id}>. Reason: ${reason}`
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '❌ Failed to ban the user. Make sure the ID is correct and I have proper permissions.',
      ephemeral: true
    });
  }
}
