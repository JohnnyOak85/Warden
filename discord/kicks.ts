import { MessageMentions } from 'discord.js';
import { BOT_ID } from '../config';
import { kickUser } from './members';

export const kickMember = (mentions: MessageMentions, moderatorId: string, reason: string) => {
  try {
    const reply: string[] = [];

    mentions.members?.forEach((member) => {
      if (member.id === BOT_ID) {
        reply.push('Nice try.');
        return;
      }

      if (moderatorId === member.user.id) {
        reply.push('You cannot moderate yourself!');
        return;
      }

      if (!member.manageable) {
        reply.push(`You cannot moderate ${member.user.username}.`);
        return;
      }

      member.kick(reason);
      kickUser(member, reason);
      reply.push(`${member.displayName} has been kicked.\n${reason}`);
    });

    return reply.join('\n');
  } catch (error) {
    throw error;
  }
};
