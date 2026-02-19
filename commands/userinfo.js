import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Information about a user.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The user to get info about')
      .setRequired(false)
  );

export async function execute(client, interaction) {
  const user = interaction.options.getUser('target') || interaction.user;
  interaction.reply(`**User Info:**\n- Username: ${user.tag}\n- ID: ${user.id}\n- Bot?: ${user.bot}`);
}
