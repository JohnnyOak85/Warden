import { Message } from 'discord.js';
import { warnMember } from '../helpers/punishment';
import { iterateMembers } from '../helpers/members';
import { logError } from '../tools/logs';

module.exports = {
    name: 'warn',
    description: 'Adds an infraction to a user.',
    usage: '<user> <reason>',
    execute: async (message: Message, args: string[]) => {
        if (!message.mentions.members?.size) return;

        if (!message.member?.permissions.has('ModerateMembers')) {
            message.channel.send('You do not have permission to warn members');
            return;
        }

        try {
            const reply = iterateMembers(
                message.mentions,
                message.member.user.id,
                args.filter(arg => !arg.includes('<@')).join(' '),
                'PLACHOLDER',
                warnMember
            );

            message.channel.send(reply);
        } catch (error) {
            logError(error);
        }
    }
};
