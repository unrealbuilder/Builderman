// events/messageCreate.js
export default async (client, message) => {
  if (message.author.bot) return;

  const member = message.guild?.members.cache.get(message.author.id);
  if (!member) return;

  const muteRole = message.guild.roles.cache.find(r => r.name === 'Muted');
  if (muteRole && member.roles.cache.has(muteRole.id)) {
    // Delete their message
    if (message.deletable) await message.delete();

    // DM the user
    try {
      await message.author.send(`❌ You are muted in **${message.guild.name}** and cannot send messages.`);
    } catch {
      // User cannot be DMed
    }
  }
};
