import { Message, MessageReaction, ReactionCollector, User } from 'discord.js';
import { ROLES_CHANNEL } from '../config';
import { CollectionFactory } from '../tools/collection.factory';
import { getConfigMap } from '../tools/configurations';
import { logError } from '../tools/logs';
import { findRoleByName } from './roles';

const reactionCollectors = new CollectionFactory<ReactionCollector>();

const createCollector = (message: Message, reactions: string[]) =>
  message.createReactionCollector({
    dispose: true,
    filter: (reaction, u) => reaction.emoji.name !== null && reactions.includes(reaction.emoji.name)
  });

const updateRole = async (reaction: MessageReaction, user: User, roleName: string, remove = false) => {
  if (!reaction.emoji.name || user.bot || !roleName || !reaction.message.guild) return;

  try {
    const member = await reaction.message.guild.members.fetch(user);
    const role = findRoleByName(reaction.message.guild.roles, roleName);

    if (!role) {
      logError(`Could not find role ${roleName}`);
      return;
    }

    if (remove) {
      member.roles.remove(role);
    } else {
      member.roles.add(role);
    }
  } catch (error) {
    throw error;
  }
};

const removeReaction = async (reaction: MessageReaction, previous: MessageReaction, user: User, roleName: string | undefined) => {
  try {
    if (!reaction.emoji.name || reaction.emoji.name === previous.emoji.name || !roleName || !reaction.message.guild) return;

    const member = await reaction.message.guild.members.fetch(user);
    const role = findRoleByName(reaction.message.guild.roles, roleName);

    if (!role) {
      logError(`Could not find role ${roleName}`);
      return;
    }

    reaction.users.remove(user);
    member.roles.remove(role);
  } catch (error) {
    throw error;
  }
};

export const setReactionCollector = (message: Message, mapName: string, stack = false) => {
  const map = getConfigMap<string>(mapName);
  const collector = createCollector(message, Object.keys(map));

  reactionCollectors.addItem(mapName, collector);

  if (!message.guild) return;

  collector.on('collect', (reaction, user) => {
    updateRole(reaction, user, map[reaction.emoji.name || '']);

    if (!stack) {
      collector.collected.forEach((r) => {
        removeReaction(r, reaction, user, map[r.emoji.name || '']);
      });

      message.reactions.valueOf().forEach(async (oldReaction) => {
        if (oldReaction === reaction) return;

        const sameUser = await oldReaction.users.fetch().then((list) => list.find((oldReactionUser) => oldReactionUser === user));

        if (!sameUser) return;

        removeReaction(oldReaction, reaction, sameUser, map[oldReaction.emoji.name || '']);
      });
    }
  });

  collector.on('remove', (reaction, user) => {
    updateRole(reaction, user, map[reaction.emoji.name || ''], true);
  });
};

export const updateReactionCollector = (message: Message, mapName: string, stack = false) => {
  if (message.channel.id !== ROLES_CHANNEL) return;

  reactionCollectors.deleteItem(mapName);
  setReactionCollector(message, mapName, stack);
};
