import { Client } from 'discord.js';
import { TOKEN } from './config';
import { checkMemberChanges, registerMember, removeUser, unbanUser } from './discord/members';
import { startGuild } from './discord/guild';
import { recordBannedUser } from './discord/bans';
import { logError } from './tools/logs';
import { deleteEmoji, recordEmoji } from './discord/emojis';
import { deleteRole, recordRole } from './discord/roles';
import { checkIncomingMessage, checkMessageUpdate, checkQuote } from './discord/messages';

const bot = new Client({
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_BANS',
    'GUILD_EMOJIS_AND_STICKERS',
    'GUILD_INTEGRATIONS',
    'GUILD_WEBHOOKS',
    'GUILD_INVITES',
    'GUILD_VOICE_STATES',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING',
    'GUILD_SCHEDULED_EVENTS'
  ]
});

bot.login(TOKEN);

bot.on('ready', () => startGuild(bot.guilds));

bot.on('message', async (message) => checkIncomingMessage(message));
bot.on('messageUpdate', async (m, message) => checkMessageUpdate(message.partial ? undefined : message));
bot.on('messageReactionAdd', (reaction) =>
  checkQuote(reaction.message.partial ? undefined : reaction.message, reaction.emoji.name || '', reaction.count || 0)
);

bot.on('guildMemberAdd', (member) => registerMember(member));
bot.on('guildMemberRemove', (member) => removeUser(member.partial ? undefined : member));
bot.on('guildMemberUpdate', (m, member) => checkMemberChanges(member));

bot.on('emojiCreate', (emoji) => recordEmoji(emoji));
bot.on('emojiDelete', (emoji) => deleteEmoji(emoji));
bot.on('emojiUpdate', (emoji) => recordEmoji(emoji));

bot.on('roleCreate', (role) => recordRole(role));
bot.on('roleDelete', (role) => deleteRole(role));
bot.on('roleUpdate', (role) => recordRole(role));

bot.on('guildBanAdd', (ban) => {
  recordBannedUser(ban.user, ban.reason || '', ban.guild.id);
});
bot.on('guildBanRemove', (ban) => {
  unbanUser(ban.guild.members, ban.user);
});

bot.on('error', (error) => {
  logError(error);
});
