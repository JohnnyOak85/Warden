import { GuildEmoji, GuildEmojiManager } from 'discord.js';
import { DataMap } from '../tools/configurations';
import { getDoc, saveDoc } from '../tools/database';
import { logError } from '../tools/logs';

export const recordEmojis = (manager: GuildEmojiManager) => {
  try {
    const map: DataMap<string> = {};

    manager.cache.forEach((emoji) => (map[emoji.id] = emoji.name || ''));

    saveDoc(map, manager.guild.id, 'emojis');
  } catch (error) {
    logError(error);
  }
};

export const recordEmoji = (emoji: GuildEmoji) => {
  try {
    const doc = getDoc<DataMap<string>>(emoji.guild.id, 'emojis');

    doc[emoji.id] = emoji.name || '';

    saveDoc(doc, emoji.guild.id, 'emojis');
  } catch (error) {
    logError(error);
  }
};

export const deleteEmoji = (emoji: GuildEmoji) => {
  try {
    const doc = getDoc<DataMap<string>>(emoji.guild.id, 'emojis');

    delete doc[emoji.id];

    saveDoc(doc, emoji.guild.id, 'emojis');
  } catch (error) {
    logError(error);
  }
};
