const pkg = require('../package.json');
module.exports = {
  name: 'info',
  description: 'Shows bot info.',
  cooldown: 5,
  async execute(client, message, args) {
    const embed = {
      title: 'Bot Information',
      color: 0x00AE86,
      fields: [
        { name: 'Name', value: `${client.user.tag}`, inline: true },
        { name: 'Version', value: `${pkg.version || '1.0.0'}`, inline: true },
        { name: 'Creator', value: 'unrealbuilder', inline: true }
      ],
      timestamp: new Date()
    };
    await message.channel.send({ embeds: [embed] });
  }
};
