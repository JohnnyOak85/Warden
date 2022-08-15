import { Message } from 'discord.js';
import { banMember } from '../helpers/punishment';
import { iterateMembers } from '../helpers/members';

module.exports = {
    name: 'ban',
    description: 'Bans a user from the guild, can be temporary',
    usage: '<user> <reason> <time in days>',
    execute: async (message: Message, args: string[]) => {
        if (!message.mentions.members?.size) return;

        if (!message.member?.permissions.has('BanMembers')) {
            message.channel.send('You do not have permission to ban members.');
            return;
        }

        try {
            const reply = iterateMembers(
                message.mentions,
                message.member.user.id,
                args.filter(arg => !arg.includes('<@')).join(' '),
                'You cannot ban yourself!',
                banMember
            );

            message.channel.send(reply);
        } catch (error) {
            throw error;
        }
    }
};
