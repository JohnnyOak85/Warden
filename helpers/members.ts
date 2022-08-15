import { MessageMentions } from 'discord.js';
import { BOT_ID } from '../config';
import { Action, Member } from '../interfaces';
import { getAllDocs } from '../storage/database';
import { setInfractions } from './infractions';
import { setStrikes } from './strikes';

export const iterateMembers = (
    mentions: MessageMentions,
    moderatorId: string,
    reason: string,
    customReply: string,
    action: Action,
    amount?: string
) => {
    try {
        const reply: string[] = [];

        mentions.members?.forEach(member => {
            if (member.id === BOT_ID) {
                reply.push('Nice try.');
                return;
            }

            if (moderatorId === member.user.id) {
                reply.push(customReply);
                return;
            }

            action(member, reply, reason, amount);
        });

        return reply.join('\n');
    } catch (error) {
        throw error;
    }
};

export const setMembers = async () => {
    try {
        const docs = await getAllDocs<Member>();

        for (const doc of docs) {
            if (doc) {
                setInfractions(doc._id, doc);
                setStrikes(doc._id, doc);
            }
        }
    } catch (error) {
        throw error;
    }
};
