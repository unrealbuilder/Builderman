import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('server')
  .setDescription('Shows server information.');

export async function execute(client, interaction) {
  try {
    const guild = interaction.guild;
    const embed = {
      title: guild.name,
      color: 0x3498db,
      fields: [
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Created', value: `${guild.createdAt.toDateString()}`, inline: true }
      ],
      thumbnail: { url: guild.iconURL() }
    };
    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}
