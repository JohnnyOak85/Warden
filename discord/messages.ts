import { Message, MessageManager } from 'discord.js';
import { BOT_ID } from '../config';
import { executeCommand } from '../tools/commands';
import { logError } from '../tools/logs';
import { getNumber } from '../tools/math';
import { recordQuote } from '../tools/quotes';
import { checkCaps, checkRepeatedWords, getReply, getResponse } from '../tools/strings';
import { updateRolesChannel } from './channels';
import { findEmbed } from './embeds';

export const findMessageByEmbed = async (manager: MessageManager, title: string) => {
  try {
    const list = await manager.fetch();
    return list.find((m) => !!findEmbed(m.embeds, title));
  } catch (error) {
    throw error;
  }
};

export const findMessageByContent = async (manager: MessageManager, content: string) => {
  try {
    const list = await manager.fetch();
    return list.find((m) => m.content.includes(content));
  } catch (error) {
    throw error;
  }
};
const reply = (message: Message) => {
  try {
    const reply = getReply(message.content.toLowerCase(), 'replies');

    if (!reply) return;

    message.channel.send(reply);
  } catch (error) {
    throw error;
  }
};

const react = (message: Message) => {
  try {
    const reaction = getReply(message.content.toLowerCase(), 'reactions');

    if (!reaction) return;

    message.channel.send(reaction);
  } catch (error) {
    throw error;
  }
};

const filterMessages = async (manager: MessageManager, id: string) => {
  try {
    const list = await manager.fetch({ limit: 25 });

    return list.filter((message) => message.author.id === id);
  } catch (error) {
    throw error;
  }
};

const findOwnMessage = async (manager: MessageManager, reply: string, id: string) => {
  try {
    const list = await filterMessages(manager, BOT_ID);

    if (!list) return;

    return !!list.find((message) => message.content.includes(reply) && message.content.includes(id));
  } catch (error) {
    throw error;
  }
};

const checkRepeatedMessages = async (message: Message) => {
  try {
    const list = await filterMessages(message.channel.messages, message.author.id);

    if (!list) return;

    return list.filter((repeat) => repeat.id !== message.id && repeat.content === message.content).map((x) => x).length >= 3;
  } catch (error) {
    throw error;
  }
};

const checkMessage = async (message: Message) => {
  try {
    if (message.channel.type !== 'GUILD_TEXT' || !message.content) return;

    if (message.mentions.users.size >= 3) {
      return getResponse('mentions', 'Too many mentions.');
    }

    if (checkCaps(message.content.replace(/[^\w]/g, ''))) {
      return getResponse('caps', 'Too many caps.');
    }

    if (checkRepeatedWords(message.content) || (await checkRepeatedMessages(message))) {
      return getResponse('repeats', 'Too much spam');
    }
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

    if (message.guild) {
      updateRolesChannel(message.guild.channels, message);
    }

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

    if (message.guild) {
      updateRolesChannel(message.guild.channels, message);
    }
  } catch (error) {
    logError(error);
  }
};

export const checkQuote = (message: Message | undefined, emoji: string, count: number) => {
  if (!message) return;

  try {
    recordQuote(emoji, count, `> ${message.content}\n*${message.member?.nickname}, ${message.createdAt.getFullYear()}*`, message?.guild?.id || '');
  } catch (error) {
    logError(error);
  }
};

export const deleteMessages = async (manager: MessageManager, amount: string) => {
  try {
    const list = await manager.fetch({ limit: (getNumber(amount) || 1) + 1 });

    list.forEach((m) => m.delete());
  } catch (error) {
    throw error;
  }
};
