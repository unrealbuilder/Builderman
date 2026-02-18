const path = require('path');
module.exports = {
  name: 'reload',
  description: 'Reload a command file (owner only). Usage: !reload hello',
  cooldown: 2,
  ownerOnly: true,
  async execute(client, message, args) {
    const name = args[0];
    if (!name) return message.reply('Specify a command name to reload.');
    const cmdPath = path.join(__dirname, `${name}.js`);
    try {
      delete require.cache[require.resolve(cmdPath)];
      const newCmd = require(cmdPath);
      if (!newCmd || !newCmd.name) return message.reply('Invalid command file.');
      // replace in collection (remove old aliases too)
      // remove entries that point to old command by name
      for (const [k, v] of client.commands) {
        if (v && v.name === name) client.commands.delete(k);
      }
      client.commands.set(newCmd.name, newCmd);
      if (Array.isArray(newCmd.aliases)) for (const a of newCmd.aliases) client.commands.set(a, newCmd);
      message.reply(`Reloaded command: ${name}`);
    } catch (err) {
      console.error('Reload error:', err);
      message.reply(`Failed to reload ${name}: ${err.message}`);
    }
  }
};
