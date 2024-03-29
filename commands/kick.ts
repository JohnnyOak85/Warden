import { Message } from 'discord.js';
import { kickMember } from '../helpers/punishment';
import { iterateMembers } from '../helpers/members';
import { logError } from '../tools/logs';

module.exports = {
    name: 'kick',
    description: 'Removes a user from the guild.',
    usage: '<user> <reason>',
    execute: async (message: Message, args: string[]) => {
        if (!message.mentions.members?.size) return;

        if (!message.member?.permissions.has('KickMembers')) {
            message.channel.send('You do not have permission to kick members');
            return;
        }

        try {
            const reply = iterateMembers(
                message.mentions,
                message.member.user.id,
                args.filter(arg => !arg.includes('<@')).join(' '),
                'Stop kicking yourself!',
                kickMember
            );

            message.channel.send(reply);
        } catch (error) {
            logError(error);
        }
    }
};
