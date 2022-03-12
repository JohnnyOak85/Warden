import { GuildChannelManager, Message, NonThreadGuildBasedChannel } from 'discord.js';
import { DataMap } from '../tools/configurations';
import { getDoc, saveDoc } from '../tools/database';
import { logError } from '../tools/logs';
import { getEmbedConfig } from './embeds';
import { findMessageByContent } from './messages';
import { setReactionCollector, updateReactionCollector } from './reactions';

export const findChannel = (manager: GuildChannelManager, name: string) => manager.cache.find((channel) => channel.name === name);

export const recordChannels = (manager: GuildChannelManager) => {
  try {
    const map: DataMap<string> = {};

    manager.cache.forEach((channel) => (map[channel.id] = channel.name));

    saveDoc(map, manager.guild.id, 'channels');
  } catch (error) {
    logError(error);
  }
};

export const recordChannel = (channel: NonThreadGuildBasedChannel | undefined) => {
  try {
    if (!channel) return;

    const doc = getDoc<DataMap<string>>(channel.guild.id, 'channels');

    doc[channel.id] = channel.name || '';

    saveDoc(doc, channel.guild.id, 'channels');
  } catch (error) {
    logError(error);
  }
};

export const deleteChannel = (channel: NonThreadGuildBasedChannel | undefined) => {
  try {
    if (!channel) return;

    const doc = getDoc<DataMap<string>>(channel.guild.id, 'channels');

    delete doc[channel.id];

    saveDoc(doc, channel.guild.id, 'channels');
  } catch (error) {
    logError(error);
  }
};

export const setRolesChannel = async (manager: GuildChannelManager) => {
  try {
    const channel = findChannel(manager, 'roles') || (await manager.create('roles', { type: 'GUILD_TEXT' }));

    if (!channel.isText()) return;

    const configs = getEmbedConfig();

    for (const config of configs) {
      const message = await findMessageByContent(channel.messages, config.map);

      if (!message) {
        logError(`Could not find message for ${config.map}`);
        continue;
      }

      setReactionCollector(message, config.map, config.stack);
    }
  } catch (error) {
    logError(error);
  }
};

export const updateRolesChannel = async (manager: GuildChannelManager, message: Message) => {
  try {
    const channel = findChannel(manager, 'roles') || (await manager.create('roles', { type: 'GUILD_TEXT' }));

    if (!channel.isText()) return;

    const config = getEmbedConfig().find((conf) => message.content.includes(conf.map));

    if (!config) return;

    updateReactionCollector(message, config.map, config.stack);
  } catch (error) {
    throw error;
  }
};
