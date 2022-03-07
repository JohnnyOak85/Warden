import { MessageReaction, User } from 'discord.js';

export const updateRole = async (reaction: MessageReaction, user: User, role: string, remove = false) => {
  if (!reaction.emoji.name || user.bot || !role) return;

  const member = await reaction.message.guild?.members.fetch(user);

  if (!member) return;

  if (remove) {
    member.roles.remove(role);
  } else {
    member.roles.add(role);
  }
};

export const removeReaction = async (reaction: MessageReaction, previous: MessageReaction, user: User, role: string | undefined) => {
  const member = await reaction.message.guild?.members.fetch(user);

  if (!member || !reaction.emoji.name || reaction.emoji.name === previous.emoji.name || !role) return;

  reaction.users.remove(user);
  member.roles.remove(role);
};
