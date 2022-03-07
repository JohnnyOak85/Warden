import { GuildBanManager, User } from 'discord.js';
import { docExists, saveDoc } from '../tools/database';
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

export const recordBannedUser = (user: User, reason: string, guild: string) =>
  docExists(guild, user.id).then((bool) => (bool ? saveDoc(buildBannedUser(user, getReason(reason)), guild, user.id) : null));

export const recordBannedUsers = (manager: GuildBanManager) =>
  manager.cache.forEach((ban) => recordBannedUser(ban.user, ban.reason || 'No reason provided', ban.guild.id));
