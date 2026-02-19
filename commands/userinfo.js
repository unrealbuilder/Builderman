import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Displays information about a user')
  .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false));

export async function execute(client, interaction) {
  const user = interaction.options.getUser('user') || interaction.user;
  const member = interaction.guild.members.cache.get(user.id);

  const embed = new EmbedBuilder()
    .setTitle(`👤 User Info: ${user.tag}`)
    .setColor('Purple')
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'ID', value: user.id, inline: true },
      { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'N/A', inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true }
    )
    .setFooter({ text: 'User Info | Open Source' });

  await interaction.reply({ embeds: [embed] });
}
