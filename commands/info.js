import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Shows bot information.');

export async function execute(client, interaction) {
  try {
    // Dynamic import for package.json
    const pkg = await import('../package.json', { assert: { type: 'json' } }).catch(() => ({ default: { version: '1.0.0' } }));
    const version = pkg.default?.version || '1.0.0';

    const embed = {
      title: 'Bot Information',
      color: 0x00AE86,
      fields: [
        { name: 'Name', value: `${client.user.tag}`, inline: true },
        { name: 'Version', value: version, inline: true },
        { name: 'Creator', value: 'unrealbuilder', inline: true },
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      ],
      timestamp: new Date()
    };

    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}
