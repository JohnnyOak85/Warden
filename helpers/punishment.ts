import { GuildMember } from 'discord.js';
import { TIMEOUT_MIN } from '../config';
import { getNumber, isNumber } from '../tools/math';
import { addInfraction } from './infractions';

export const banMember = (member: GuildMember, reply: string[], reason: string) => {
    try {
        if (!member.bannable) {
            reply.push(`You cannot ban ${member.user.username}.`);
            return;
        }

        member.ban({ deleteMessageDays: 1, reason });
        reply.push(`${member.displayName} has been banned.\n${reason}`);
    } catch (error) {
        throw error;
    }
};

export const kickMember = (member: GuildMember, reply: string[], reason: string) => {
    try {
        if (!member.kickable) {
            reply.push(`You cannot kick ${member.user.username}.`);
            return;
        }

        member.kick(reason);
        reply.push(`${member.displayName} has been kicked.\n${reason}`);
    } catch (error) {
        throw error;
    }
};

export const timeoutMember = (
    member: GuildMember,
    reply: string[],
    reason: string,
    amount = `${TIMEOUT_MIN}`
) => {
    try {
        if (!member.manageable || !member.moderatable) {
            reply.push(`You cannot timeout ${member.user.username}.`);
            return;
        }

        const time = getNumber(amount, 16) || 1;

        if (isNumber(amount) || amount === time.toString()) {
            const split = reason.split(' ');
            split.pop();
            reason = split.join(' ');
        }

        member.timeout(time * 60 * 1000, reason);

        reply.push(`${member.displayName} has been timed out for ${time} minutes.\n${reason}`);
    } catch (error) {
        throw error;
    }
};

export const warnMember = (member: GuildMember, reply: string[], reason: string) => {
    try {
        if (!member.manageable || !member.moderatable) {
            reply.push(`You cannot warn ${member.user.username}.`);
            return;
        }

        addInfraction(member.id, reason);

        reply.push(`${member.displayName} has been warned.\n${reason}`);
    } catch (error) {
        throw error;
    }
};
