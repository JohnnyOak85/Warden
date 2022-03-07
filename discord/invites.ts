import { GuildInviteManager } from 'discord.js';
import { findChannel } from './channels';

const createInvite = (manager: GuildInviteManager, name: string) => {
  const channel = findChannel(manager.guild.channels, name || 'general-chat');

  if (channel?.type !== 'GUILD_TEXT') return;

  return manager.create(channel);
};

const findInvite = (manager: GuildInviteManager, name: string) => manager.cache.find((invite) => !invite.temporary && invite.channel.name === name);
export const getInvite = async (manager: GuildInviteManager, name: string) => findInvite(manager, name) || createInvite(manager, name);
