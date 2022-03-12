import { ColorResolvable, MessageEmbed } from 'discord.js';
import { getConfig } from '../tools/configurations';

export interface EmbedConfig {
  embed: {
    description: string;
    title: string;
  };
  map: string;
  stack: boolean;
}

interface EmbedMap {
  color?: ColorResolvable;
  description?: string;
  title: string;
  thumb?: string | null;
  url?: string;
}

export const findEmbed = (embeds: MessageEmbed[], title: string) => embeds.find((embed) => embed.title?.includes(title));

export const getEmbedConfig = () => {
  try {
    return getConfig<EmbedConfig[]>('embeds');
  } catch (error) {
    throw error;
  }
};

export const buildEmbed = (embed: EmbedMap) => {
  try {
    return new MessageEmbed()
      .setColor(embed.color || 'DEFAULT')
      .setDescription(embed.description || '')
      .setTitle(embed.title || '')
      .setThumbnail(embed.thumb || '')
      .setURL(embed.url || '');
  } catch (error) {
    throw error;
  }
};
