import { GuildMember, GuildMemberManager, User } from 'discord.js';
import { docExists, findDoc, getDoc, saveDoc, updateDoc } from '../tools/database';
import { logError } from '../tools/logs';
import { getResponse } from '../tools/strings';
import { clearTimer } from '../tools/time';
import { getInvite } from './invites';
import { ensureRoles, getRole } from './roles';

interface UserDoc {
  id?: string;
  anniversary?: Date;
  joinedAt?: Date | null;
  nickname?: string | null;
  removed?: boolean;
  roles?: string[];
  strikes?: string[];
  timer?: string;
  username?: string;
}

const getUser = (member: GuildMember) => {
  try {
    const doc = getDoc<UserDoc>(member.guild.id, member.user.id);

    return ensureUser(doc, member);
  } catch (error) {
    throw error;
  }
};

const ensureUserDoc = (member: GuildMember) => {
  try {
    return getUser(member);
  } catch (error) {
    return {
      id: member.id,
      nickname: member.nickname,
      roles: ensureRoles(member.roles, []),
      username: member.user.username
    };
  }
};

const ensureUser = (user: UserDoc, member: GuildMember) => {
  user.id = user.id || member.id;
  user.joinedAt = user.joinedAt || member.joinedAt;
  user.nickname = user.nickname || member.nickname;
  user.roles = ensureRoles(member.roles, user.roles || []);
  user.username = user.username || member.user.username;

  return user;
};

export const findUser = (guild: string, user: string) => {
  try {
    return findDoc<UserDoc>(guild, user);
  } catch (error) {
    throw error;
  }
};

const bulkAddRoles = (user: UserDoc, member: GuildMember) => {
  try {
    for (const roleId of user.roles || []) {
      const role = getRole(member.guild.roles, roleId);

      if (role) {
        member.roles.add(role);
      }
    }
  } catch (error) {
    throw error;
  }
};

const checkJoined = async (user: UserDoc, member: GuildMember) => {
  if (!user.joinedAt) {
    user.joinedAt = member.joinedAt;

    return getResponse('welcome', `Welcome <@${member.user.id}>! Enjoy your stay!`).replace('§nickname', `<@${member.user.id}>`);
  } else {
    try {
      bulkAddRoles(user, member);

      if (user.nickname) member.setNickname(user.nickname);
    } catch (error) {
      logError(error);
    }

    user.removed = false;

    return getResponse('rejoin', `Rejoice! <@${member.user.id}> is back!`).replace('§nickname', `<@${member.user.id}>`);
  }
};

export const checkMemberChanges = (member: GuildMember) => {
  try {
    const user = getUser(member);

    user.roles = ensureRoles(member.roles, user.roles || []);
    user.nickname = member.nickname;

    saveDoc(user, member.guild.id, member.user.id);
  } catch (error) {
    logError(error);
  }
};

export const registerMember = async (member: GuildMember) => {
  try {
    if (member.user.bot) return;

    const user = ensureUserDoc(member);

    const reply = await checkJoined(user, member);

    user.nickname = member.nickname;

    saveDoc(user, member.guild.id, member.user.id);

    member.guild.systemChannel?.send(reply);
  } catch (error) {
    logError(error);
  }
};

export const removeUser = (member: GuildMember | undefined) => {
  try {
    if (!member || member.user.bot) return;

    const user = getUser(member);

    user.removed = true;

    saveDoc(user, member.guild.id, member.user.id);

    member.guild.systemChannel?.send(getResponse('memberLeft', `${user.username} has left the building!`).replace('§nickname', member.user.username));
  } catch (error) {
    logError(error);
  }
};

export const recordMembers = (manager: GuildMemberManager) => {
  try {
    manager.cache.forEach((member) => {
      if (member.user.bot) return;

      const user = ensureUser({}, member);

      if (docExists(member.guild.id, member.id)) {
        updateDoc(user, member.guild.id, member.id);
      } else {
        saveDoc(user, member.guild.id, member.id);
      }
    });
  } catch (error) {
    logError(error);
  }
};

export const unbanUser = async (manager: GuildMemberManager, user: User) => {
  try {
    manager.unban(user);
    manager.guild.systemChannel?.send(getResponse('unban', `${user.username} is no longer banned.`).replace('§nickname', user.username));

    clearTimer(user.id);

    const invite = await getInvite(manager.guild.invites, 'general-chat');

    if (invite) {
      user.createDM().then((dm) => dm.send(`${getResponse('unbanDM', `You are no longer banned from ${manager.guild.name}`)}\n${invite}`));
    }
  } catch (error) {
    throw error;
  }
};
