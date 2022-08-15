import { Message } from 'discord.js';
import { timeoutMember } from '../helpers/punishment';
import { iterateMembers } from '../helpers/members';

module.exports = {
    name: 'timeout',
    description:
        "Temporarily revokes a user's permission to send messages to a maximum of 15 minutes",
    usage: '<user> <reason> <time in minutes>',
    execute: async (message: Message, args: string[]) => {
        if (!message.mentions.members?.size) return;

        if (!message.member?.permissions.has('MuteMembers')) {
            message.channel.send('You do not have permission to timeout members.');
            return;
        }

        try {
            const reply = iterateMembers(
                message.mentions,
                message.member.user.id,
                args.filter(arg => !arg.includes('<@')).join(' '),
                "Why don't you take yourself to the naughty corner?",
                timeoutMember,
                args.pop() || ''
            );

            message.channel.send(reply);
        } catch (error) {
            throw error;
        }
    }
};
