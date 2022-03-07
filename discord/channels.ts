import { GuildChannelManager } from 'discord.js';
import { getMap, recordMap } from '../tools/data';
import { buildEmbed, getEmbedConfig } from './embeds';
import { findMessageByEmbed, setReactionCollector } from './messages';

export const findChannel = (manager: GuildChannelManager, name: string) => manager.cache.find((channel) => channel.name === name);
export const recordChannels = (manager: GuildChannelManager) =>
  recordMap(
    manager.cache.map((channel) => ({ [channel.id]: channel.name })),
    'channels'
  );
const ensureChannel = (manager: GuildChannelManager, name: string) => findChannel(manager, name) || createChannel(manager, name);
const createChannel = (manager: GuildChannelManager, name: string) => manager.create(name, { type: 'GUILD_TEXT' });

export const setRolesChannel = async (manager: GuildChannelManager) => {
  const channel = await ensureChannel(manager, 'roles');

  if (!channel.isText()) return;

  const configMap = await getEmbedConfig();

  for (const config of configMap) {
    const embed = buildEmbed(config.embed);
    const message = findMessageByEmbed(channel.messages, embed.title || '') || (await channel.send({ embeds: [embed] }));

    setReactionCollector(message, await getMap<string>(config.map), config.stack);
  }
};
