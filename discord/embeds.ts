import { ColorResolvable, MessageEmbed } from 'discord.js';
import { getDoc } from '../tools/database';

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

export const findEmbed = (embeds: MessageEmbed[], title: string) => embeds.find((embed) => embed.title === title);
export const getEmbedConfig = () => getDoc<EmbedConfig[]>('', 'roles_config');
export const buildEmbed = (embed: EmbedMap) =>
  new MessageEmbed()
    .setColor(embed.color || 'DEFAULT')
    .setDescription(embed.description || '')
    .setTitle(embed.title || '')
    .setThumbnail(embed.thumb || '')
    .setURL(embed.url || '');
