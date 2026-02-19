import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('legal')
  .setDescription('View the bot’s Terms of Service and Privacy Policy.');

export async function execute(client, interaction) {
  await interaction.deferReply({ ephemeral: true });

  const embed = new EmbedBuilder()
    .setTitle('📜 Legal & Privacy Notice')
    .setColor(0x5865F2)
    .setDescription(
      `By using **[Your Bot Name]**, you acknowledge that you have read, understood, and agreed to our Terms of Service and Privacy Policy.\n\n` +
      `Please review the summaries below and click the buttons to read the full documents on GitHub.`
    )
    .addFields(
      {
        name: '📘 Terms of Service (Summary)',
        value:
          `• The bot is free of charge.\n` +
          `• Follow Discord’s Terms of Service.\n` +
          `• Do not abuse moderation features or exploit the bot.\n` +
          `• The bot is provided "as-is" without warranties.\n` +
          `• We may update, modify, or remove access at any time.`,
      },
      {
        name: '🔐 Privacy Policy (Summary)',
        value:
          `• User IDs, usernames, and server IDs may be used for functionality.\n` +
          `• Messages accessed only when required.\n` +
          `• We do not sell or share personal data.\n` +
          `• Data stored only when necessary.\n` +
          `• Continued use implies acceptance of this policy.`,
      }
    )
    .setFooter({
      text: 'Continued use of this bot constitutes agreement to these policies.'
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('View Full Terms of Service')
      .setStyle(ButtonStyle.Link)
      .setURL('https://github.com/unrealbuilder/Builderman'),

    new ButtonBuilder()
      .setLabel('View Full Privacy Policy')
      .setStyle(ButtonStyle.Link)
      .setURL('https://github.com/unrealbuilder/Builderman')
  );

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}
