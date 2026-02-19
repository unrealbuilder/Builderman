import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('List all commands or info about a specific command')
  .addStringOption(option =>
    option.setName('command')
      .setDescription('Get info about a specific command')
      .setRequired(false)
  );

export async function execute(client, interaction) {
  const commandName = interaction.options.getString('command');
  if (commandName) {
    const command = client.commands.get(commandName);
    if (!command) return interaction.reply({ content: 'Command not found.', ephemeral: true });
    return interaction.reply({ content: `**${command.data.name}**: ${command.data.description}`, ephemeral: true });
  }

  const commandList = [...client.commands.keys()].join(', ');
  interaction.reply({ content: `Available commands: ${commandList}`, ephemeral: true });
}
