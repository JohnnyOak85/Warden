import { GuildManager } from 'discord.js';
import { setCommands } from '../tools/commands';
import { ensureDatabase } from '../tools/database';
import { logError, logInfo } from '../tools/logs';
import { startTimers } from '../tools/time';
import { recordBannedUsers } from './bans';
import { recordChannels, setRolesChannel } from './channels';
import { recordEmojis } from './emojis';
import { recordMembers } from './members';
import { recordRoles } from './roles';

export const startGuild = (manager: GuildManager) => {
  manager.cache.forEach((guild) => {
    try {
      ensureDatabase(guild.id);
      setCommands();
      recordChannels(guild.channels);
      recordRoles(guild.roles);
      recordEmojis(guild.emojis);
      recordBannedUsers(guild.bans);
      recordMembers(guild.members);
      setRolesChannel(guild.channels);
      startTimers(guild);
      logInfo('Bot is online!');
      console.log('ONLINE')
    } catch (error) {
      logError(error);
    }
  });
};
