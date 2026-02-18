import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export default {
  name: 'info',
  description: 'Shows bot info.',
  cooldown: 5,
  async execute(client, message, args) {
    // Determine __dirname in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Read package.json dynamically
    const pkgPath = path.join(__dirname, '../package.json');
    let pkg = {};
    try {
      const data = await readFile(pkgPath, 'utf-8');
      pkg = JSON.parse(data);
    } catch (err) {
      console.warn('Failed to read package.json:', err);
    }

    const embed = {
      title: 'Bot Information',
      color: 0x00AE86,
      fields: [
        { name: 'Name', value: `${client.user.tag}`, inline: true },
        { name: 'Version', value: `${pkg.version || '1.0.0'}`, inline: true },
        { name: 'Creator', value: 'unrealbuilder', inline: true },
      ],
      timestamp: new Date(),
    };

    await message.channel.send({ embeds: [embed] });
  },
};
