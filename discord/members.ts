import { GuildMember, GuildMemberManager, User } from 'discord.js';
import { docExists, findDoc, getDoc, saveDoc, updateDoc } from '../tools/database';
import { logError } from '../tools/logs';
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

const ensureUserDoc = async (member: GuildMember) => {
  try {
    return await getUser(member);
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

export const findUser = (guild: string, user: string) => findDoc<UserDoc>(guild, user);

const getUser = (member: GuildMember) => getDoc<UserDoc>(member.guild.id, member.user.id).then((doc) => ensureUser(doc, member));

const bulkAddRoles = (user: UserDoc, member: GuildMember) => {
  for (const roleId of user.roles || []) {
    const role = getRole(member.guild.roles, roleId);

    if (role) {
      member.roles.add(role);
    }
  }
};

const checkJoined = async (user: UserDoc, member: GuildMember) => {
  if (!user.joinedAt) {
    user.joinedAt = member.joinedAt;

    return `Welcome <@${member.user.id}>! Enjoy your stay!`;
  } else {
    bulkAddRoles(user, member);

    if (user.nickname) member.setNickname(user.nickname);

    user.removed = false;

    return `Rejoice! <@${member.user.id}> is back!`;
  }
};

export const checkMemberChanges = async (member: GuildMember) => {
  try {
    const user = await getUser(member);

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

    const user = await ensureUserDoc(member);
    const reply = await checkJoined(user, member);

    user.nickname = member.nickname;

    saveDoc(user, member.guild.id, member.user.id);

    member.guild.systemChannel?.send(reply);
  } catch (error) {
    logError(error);
  }
};

export const removeUser = async (member: GuildMember | undefined) => {
  try {
    if (!member || member.user.bot) return;

    const user = await getUser(member);

    user.removed = true;

    saveDoc(user, member.guild.id, member.user.id);

    member.guild.systemChannel?.send(`<@${member.user.id}> has left the building!`);
  } catch (error) {
    logError(error);
  }
};

export const recordMembers = (manager: GuildMemberManager) =>
  manager.cache.forEach((member) =>
    docExists(member.guild.id, member.id).then((exists) =>
      exists ? updateDoc(ensureUser({}, member), member.guild.id, member.id) : saveDoc(ensureUser({}, member), member.guild.id, member.id)
    )
  );

export const unbanUser = async (manager: GuildMemberManager, user: User) => {
  try {
    manager.unban(user);
    manager.guild.systemChannel?.send(`${user.username} is no longer banned.`);

    clearTimer(user.id);

    const invite = await getInvite(manager.guild.invites, 'general-chat');

    if (invite) {
      user.createDM().then((dm) => dm.send(`You are no longer banned from ${manager.guild.name}\n${invite}`));
    }
  } catch (error) {
    throw error;
  }
};
