module.exports = {
  name: 'hello',
  description: 'Replies with a greeting.',
  aliases: ['hi'],
  cooldown: 3, // seconds
  async execute(client, message, args) {
    await message.reply(`Hello, ${message.author.username}! 👋`);
  }
};
