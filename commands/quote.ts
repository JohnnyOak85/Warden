import { Message } from 'discord.js';
import { logError } from '../tools/logs';
import { getQuote } from '../tools/quotes';

module.exports = {
  name: 'quote',
  description: 'Reply with a random quote',
  usage: ' ',
  moderation: false,
  execute: async (message: Message) => {
    try {
      message.channel.send(getQuote(message.guild?.id || ''));
    } catch (error) {
      logError(error);
    }
  }
};
