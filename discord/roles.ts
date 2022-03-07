import { GuildMemberRoleManager, Role, RoleManager } from 'discord.js';
import { getMap, recordMap } from '../tools/data';
import { saveDoc } from '../tools/database';
import { logError } from '../tools/logs';

export const ensureRoles = (manager: GuildMemberRoleManager, roles: string[]) => roles.concat(manager.cache.map((role) => role.id));
export const getRole = (manager: RoleManager, id: string) => manager.cache.find((role) => role.id === id);
const getRolesMap = () => getMap<string>('roles');
const saveRolesMaps = (doc: any) => saveDoc(doc, 'configurations', 'roles');

export const recordRoles = (manager: RoleManager) =>
  recordMap(
    manager.cache.map((role) => ({ [role.id]: role.name })),
    'roles'
  );

export const recordRole = async (role: Role) => {
  try {
    const doc = await getRolesMap();

    doc[role.id] = role.name || '';

    saveRolesMaps(doc);
  } catch (error) {
    logError(error);
  }
};

export const deleteRole = async (role: Role) => {
  try {
    const doc = await getRolesMap();

    delete doc[role.id];

    saveRolesMaps(doc);
  } catch (error) {
    logError(error);
  }
};
