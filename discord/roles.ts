import { GuildMemberRoleManager, Role, RoleManager } from 'discord.js';
import { DataMap } from '../tools/configurations';
import { getDoc, saveDoc } from '../tools/database';
import { logError } from '../tools/logs';

export const ensureRoles = (manager: GuildMemberRoleManager, roles: string[]) => roles.concat(manager.cache.map((role) => role.id));
export const getRole = (manager: RoleManager, id: string) => manager.cache.find((role) => role.id === id);
export const findRoleByName = (manager: RoleManager, name: string) => manager.cache.find((role) => role.name === name);

export const recordRoles = (manager: RoleManager) => {
  try {
    const map: DataMap<string> = {};

    manager.cache.forEach((role) => (map[role.id] = role.name));
    
    saveDoc(map, manager.guild.id, 'roles');
  } catch (error) {
    logError(error);
  }
};

export const recordRole = (role: Role) => {
  try {
    const doc = getDoc<DataMap<string>>(role.guild.id, 'roles');

    doc[role.id] = role.name || '';

    saveDoc(doc, role.guild.id, 'roles');
  } catch (error) {
    logError(error);
  }
};

export const deleteRole = (role: Role) => {
  try {
    const doc = getDoc<DataMap<string>>(role.guild.id, 'roles');

    delete doc[role.id];

    saveDoc(doc, role.guild.id, 'roles');
  } catch (error) {
    logError(error);
  }
};
