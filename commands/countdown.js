// commands/countdown.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('countdown')
  .setDescription('Start a countdown in your DMs')
  .addIntegerOption(option =>
    option.setName('seconds')
      .setDescription('Number of seconds to count down')
      .setRequired(true)
  );

export async function execute(client, interaction) {
  const seconds = interaction.options.getInteger('seconds');

  try {
    // Send initial DM
    const dm = await interaction.user.send(`⏱ Countdown starting: ${seconds} seconds`);

    // Countdown loop
    let remaining = seconds;
    const interval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        dm.edit(`⏱ Countdown: ${remaining} seconds`);
      } else {
        dm.edit('✅ Countdown finished!');
        clearInterval(interval);
      }
    }, 1000);

    // Confirm to the user in the server
    await interaction.reply({ content: '✅ I sent you a DM with your countdown!', ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ I could not DM you. Check your privacy settings.', ephemeral: true });
  }
}
