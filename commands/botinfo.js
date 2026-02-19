import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import pkg from '../package.json' assert { type: "json" };

export const data = new SlashCommandBuilder()
  .setName('botinfo')
  .setDescription('Displays information about the bot');

export async function execute(client, interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🤖 Bot Info')
    .setColor('Blue')
    .addFields(
      { name: 'Name', value: client.user.tag, inline: true },
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Uptime', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      { name: 'Version', value: pkg.version, inline: true },
    )
    .setFooter({ text: 'Made with studs | Open Source' });

  await interaction.reply({ embeds: [embed] });
}
