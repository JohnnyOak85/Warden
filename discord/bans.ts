import { GuildBanManager, User } from 'discord.js';
import { docExists, saveDoc } from '../tools/database';
import { logError } from '../tools/logs';
import { getReason } from '../tools/strings';

const buildBannedUser = (user: User, reason: string) => {
  return {
    _id: user.id,
    joinedAt: null,
    nickname: null,
    removed: true,
    roles: [],
    strikes: [reason],
    username: user.username
  };
};

export const recordBannedUser = (user: User, reason: string, guild: string) => {
  try {
    if (!docExists(guild, user.id)) {
      logError(`${user.id} does not exist on ${guild}`);
      return;
    }

    saveDoc(buildBannedUser(user, getReason(reason)), guild, user.id);
  } catch (error) {
    throw error;
  }
};

export const recordBannedUsers = (manager: GuildBanManager) => {
  try {
    manager.cache.forEach((ban) => recordBannedUser(ban.user, ban.reason || 'No reason provided', ban.guild.id));
  } catch (error) {
    logError(error);
  }
};
