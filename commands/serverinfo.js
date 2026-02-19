import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Displays information about this server');

export async function execute(client, interaction) {
  const { guild } = interaction;

  const embed = new EmbedBuilder()
    .setTitle(`🏰 ${guild.name} Info`)
    .setColor('Green')
    .addFields(
      { name: 'Server ID', value: guild.id, inline: true },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
      { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true }
    )
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setFooter({ text: 'Server Info | Open Source' });

  await interaction.reply({ embeds: [embed] });
}
