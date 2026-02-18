module.exports = {
  name: 'server',
  description: 'Displays server name & member count.',
  cooldown: 5,
  async execute(client, message, args) {
    const guild = message.guild;
    if (!guild) return message.reply('This command only works in a server.');
    await message.reply(`Server: ${guild.name}\nMembers: ${guild.memberCount}`);
  }
};
