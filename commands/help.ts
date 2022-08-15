import { Message } from 'discord.js';
import { getCommandDescription, getCommandsDescription } from '../helpers/commands';

module.exports = {
    name: 'help',
    description:
        'Displays the list of commands. It can also display information on a given command.',
    usage: '<command>',
    moderation: false,
    execute: async (message: Message, args: string[]) => {
        // TODO This will always retrieve the same messages since the bot is only useable by moderators.

        const isModerator =
            message.member?.permissions.any([
                'Administrator',
                'BanMembers',
                'ChangeNickname',
                'DeafenMembers',
                'KickMembers',
                'ManageChannels',
                'ManageEmojisAndStickers',
                'ManageMessages',
                'ManageNicknames',
                'ManageRoles',
                'ManageThreads',
                'ModerateMembers',
                'MoveMembers',
                'MuteMembers'
            ]) || false;

        const reply = args.length
            ? getCommandDescription(args[0].toLowerCase(), isModerator)
            : getCommandsDescription(isModerator);

        message.channel.send(reply);
    }
};
