import { GuildInviteManager } from 'discord.js';
import { findChannel } from './channels';

const createInvite = (manager: GuildInviteManager, name: string) => {
  try {
    const channel = findChannel(manager.guild.channels, name || 'general-chat');

    if (channel?.type !== 'GUILD_TEXT') return;

    return manager.create(channel);
  } catch (error) {
    throw error;
  }
};

export const getInvite = async (manager: GuildInviteManager, name: string) => {
  try {
    return manager.cache.find((invite) => !invite.temporary && invite.channel.name === name) || (await createInvite(manager, name));
  } catch (error) {
    throw error;
  }
};
