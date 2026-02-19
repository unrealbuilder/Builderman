import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url))
);

export const data = new SlashCommandBuilder()
  .setName('botinfo')
  .setDescription('Displays information about the bot.');

export async function execute(interaction) {

  const embed = new EmbedBuilder()
    .setTitle('🤖 Bot Info')
    .setColor('Blue')
    .addFields(
      { name: 'Name', value: interaction.client.user.tag, inline: true },
      { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
      { name: 'Version', value: pkg.version, inline: true }
    )
    .setFooter({ text: 'Made with studs | Open Source' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
