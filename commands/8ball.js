// commands/8ball.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Ask the magic 8-ball a question!')
  .addStringOption(option =>
    option
      .setName('question')
      .setDescription('The question you want to ask')
      .setRequired(true)
  );

// Answers with optional emoji or GIF
const answers = [
  { text: 'Yes!', emoji: '✅' },
  { text: 'No!', emoji: '❌' },
  { text: 'Maybe…', emoji: '🤔' },
  { text: 'Absolutely!', emoji: '💯' },
  { text: 'Definitely not!', emoji: '🚫' },
  { text: 'Ask again later.', emoji: '⏳' },
  { text: 'I cannot tell.', emoji: '🔮' },
  { text: 'Most likely.', emoji: '👍' },
  { text: 'Very doubtful.', emoji: '😬' },
  { text: 'Signs point to yes.', emoji: '✨' },
  { text: 'Ask your pet instead 🐶', emoji: '🐾' },
  { text: 'The answer is hidden 🤫', emoji: '🤐' },
  { text: 'The stars say yes ✨', emoji: '🌟' },
  { text: 'The stars say no ✨', emoji: '🌑' },
  { text: 'Absolutely, 100%!', emoji: '🎉' },
  { text: 'Nope, not happening.', emoji: '🙅' }
];

const gifs = [
  'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif', // yes
  'https://media.giphy.com/media/l3vR1Lr2kX2K1gTTK/giphy.gif', // no
  'https://media.giphy.com/media/26xBwdIuRJiAiT6z6/giphy.gif', // maybe
];

export async function execute(client, interaction) {
  const question = interaction.options.getString('question');

  try {
    // Pick a random answer
    const answer = answers[Math.floor(Math.random() * answers.length)];
    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    // Send reply with emoji and a GIF
    await interaction.reply({
      content: `🎱 **Question:** ${question}\n**Answer:** ${answer.text} ${answer.emoji}`,
      files: [gif]
    });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: '❌ Something went wrong with the magic 8-ball.',
      ephemeral: true
    });
  }
}
