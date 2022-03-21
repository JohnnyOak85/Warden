import { Message } from 'discord.js';
import { deleteMessages } from '../discord/messages';
import { logError } from '../tools/logs';
import { getResponse } from '../tools/strings';

module.exports = {
  name: 'clear',
  description: 'Clear a set amount of lines. From 1 up to 99.',
  usage: '<number of lines>',
  moderation: true,
  execute: async (message: Message, args: string[]) => {
    const moderator = message.member?.permissions.has('MANAGE_MESSAGES') || false;

    if (!moderator) {
      message.channel.send(getResponse('unauthorized', 'You do not have permission for this command.'));
      return;
    }

    try {
      deleteMessages(message.channel.messages, args[0]);
    } catch (error) {
      logError(error);
    }
  }
};
