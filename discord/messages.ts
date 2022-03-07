import { Message, MessageManager } from 'discord.js';
import { BOT_ID } from '../config';
import { executeCommand } from '../tools/commands';
import { DataMap, recordQuote } from '../tools/data';
import { logError } from '../tools/logs';
import { checkCaps, checkRepeatedWords, getReply } from '../tools/strings';
import { findEmbed } from './embeds';
import { removeReaction, updateRole } from './reactions';

export const findMessageByEmbed = (manager: MessageManager, title: string) => manager.cache.find((m) => !!findEmbed(m.embeds, title));

const createCollector = (message: Message, reactions: string[]) =>
  message.createReactionCollector({
    dispose: true,
    filter: (reaction, u) => reaction.emoji.name !== null && reactions.includes(reaction.emoji.name)
  });

const reply = (message: Message) => getReply(message.content.toLowerCase(), 'replies').then((rep) => (rep ? message.channel.send(rep) : undefined));
const react = (message: Message) => getReply(message.content.toLowerCase(), 'reactions').then((react) => (react ? message.react(react) : undefined));

const filterMessages = async (manager: MessageManager, id: string) =>
  manager.fetch({ limit: 25 }).then((list) => list.filter((message) => message.author.id === id));

const findOwnMessage = async (manager: MessageManager, reply: string, id: string) =>
  !!filterMessages(manager, BOT_ID).then((l) => l.find((m) => m.content.includes(reply) && m.content.includes(id)));

const checkRepeatedMessages = (message: Message) =>
  filterMessages(message.channel.messages, message.author.id)
    .then((list) => list.filter((m) => m.id !== message.id && m.content === message.content))
    .then((list) => list.map((x) => x).length >= 3);

const checkMessage = async (message: Message) => {
  try {
    if (message.channel.type !== 'GUILD_TEXT' || !message.content) return;
    if (message.mentions.users.size >= 3) return 'chill with the mention train!';
    if (checkCaps(message.content.replace(/[^\w]/g, ''))) return 'stop shouting please!';
    if (checkRepeatedWords(message.content)) return 'is there an echo in here?';
    if (await checkRepeatedMessages(message)) return 'we heard you the first time!';
  } catch (error) {
    throw error;
  }
};

const illegalMessage = async (message: Message) => {
  try {
    if (!message.member || message.member.permissions.has('MANAGE_MESSAGES')) return;

    const reply = await checkMessage(message);

    if (!reply) return;

    message.delete();

    if (await findOwnMessage(message.channel.messages, reply, message.author.id)) return;

    message.reply(reply);

    return true;
  } catch (error) {
    throw error;
  }
};

export const checkIncomingMessage = async (message: Message) => {
  if (message.channel.type === 'DM' || message.author.bot) return;

  try {
    react(message);
    reply(message);

    if (await illegalMessage(message)) return;

    executeCommand(message);
  } catch (error) {
    logError(error);
  }
};

export const checkMessageUpdate = (message: Message | undefined) => {
  if (!message || message.channel.type === 'DM' || message.author.bot) return;

  try {
    react(message);

    illegalMessage(message);
  } catch (error) {
    logError(error);
  }
};

export const checkQuote = async (message: Message | undefined, emoji: string, count: number) => {
  if (!message) return;

  try {
    recordQuote(emoji, count, `${message.content}\n${message.member?.nickname}, ${message.createdAt.getFullYear()}`);
  } catch (error) {
    logError(error);
  }
};

export const setReactionCollector = (message: Message, map: DataMap<string>, stack = false) => {
  const collector = createCollector(message, Object.keys(map));

  collector.on('collect', (reaction, user) => {
    updateRole(reaction, user, map[reaction.emoji.name || '']);

    if (stack) {
      collector.collected.forEach((r) => {
        removeReaction(r, reaction, user, map[r.emoji.name || '']);
      });
    }
  });

  collector.on('remove', (reaction, user) => {
    updateRole(reaction, user, map[reaction.emoji.name || ''], true);
  });
};
