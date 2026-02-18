module.exports = {
  name: 'ping',
  description: 'Shows latency.',
  cooldown: 2,
  async execute(client, message, args) {
    const sent = await message.reply('Pinging...');
    await sent.edit(`Pong! 🏓 Latency is ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }
};
