// commands/kick.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kicks a user from the server.')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to kick')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for kicking')
      .setRequired(false)
  );

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  try {
    const member = await interaction.guild.members.fetch(user.id);
    if (!member.kickable) {
      return await interaction.reply({
        content: `❌ I cannot kick <@${user.id}>. Check my role hierarchy and permissions.`,
        ephemeral: true
      });
    }

    await member.kick(`${reason} (Kicked by ${interaction.user.tag})`);
    await interaction.reply({
      content: `✅ Successfully kicked <@${user.id}>. Reason: ${reason}`
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '❌ Failed to kick the user. Make sure the ID is correct and I have proper permissions.',
      ephemeral: true
    });
  }
}
