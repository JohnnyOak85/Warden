import { GuildEmoji, GuildEmojiManager } from 'discord.js';
import { getMap, recordMap } from '../tools/data';
import { saveDoc } from '../tools/database';
import { logError } from '../tools/logs';

const getEmojiMap = () => getMap<string>('emojis');
const saveEmojisMaps = (doc: any) => saveDoc(doc, 'configurations', 'emojis');

export const recordEmojis = (manager: GuildEmojiManager) =>
  recordMap(
    manager.cache.map((emoji) => ({ [emoji.id]: emoji.name || '' })),
    'emojis'
  );

export const recordEmoji = async (emoji: GuildEmoji) => {
  try {
    const doc = await getEmojiMap();

    doc[emoji.id] = emoji.name || '';

    saveEmojisMaps(doc);
  } catch (error) {
    logError(error);
  }
};

export const deleteEmoji = async (emoji: GuildEmoji) => {
  try {
    const doc = await getEmojiMap();

    delete doc[emoji.id];

    saveEmojisMaps(doc);
  } catch (error) {
    logError(error);
  }
};
