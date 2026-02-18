import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Shows bot information'),

  async execute(interaction) {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    await interaction.reply({
      embeds: [
        {
          title: 'Bot Info',
          color: 0x5865F2,
          fields: [
            { name: 'Bot Name', value: interaction.client.user.tag, inline: true },
            { name: 'Version', value: pkg.version || '1.0.0', inline: true },
            { name: 'Node', value: process.version, inline: true }
          ],
          timestamp: new Date()
        }
      ]
    });
  },
};
