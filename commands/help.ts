import { Message } from 'discord.js';
import { getCommandDescription, getCommandsDescription } from '../tools/commands';

module.exports = {
  name: 'help',
  description: 'Displays the list of commands. It can also display information on a given command.',
  usage: '<command>',
  moderation: false,
  execute: async (message: Message, args: string[]) => {
    const moderator = message.member?.permissions.has('MANAGE_MESSAGES') || false;
    const reply = args.length ? getCommandDescription(args[0].toLowerCase(), moderator) : getCommandsDescription(moderator);

    message.channel.send(reply);
  }
};
