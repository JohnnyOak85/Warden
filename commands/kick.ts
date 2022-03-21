import { Message } from 'discord.js';
import { kickMember } from '../discord/kicks';
import { logError } from '../tools/logs';
import { getResponse } from '../tools/strings';

module.exports = {
  name: 'kick',
  description: 'Removes a user from the guild.',
  usage: '<user> <reason>',
  moderation: true,
  execute: async (message: Message, args: string[]) => {
    const moderator = message.member?.permissions.has('KICK_MEMBERS') || false;

    if (!moderator) {
      message.channel.send(getResponse('unauthorized', 'You do not have permission for this command.'));
      return;
    }

    if (!message.mentions.members?.size) return;

    try {
      message.channel.send(kickMember(message.mentions, message.member?.user.id || '', args.filter((arg) => !arg.includes('<@!')).join(' ')));
    } catch (error) {
      logError(error);
    }
  }
};
