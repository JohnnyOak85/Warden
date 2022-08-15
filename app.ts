import { Client } from 'discord.js';
import { TOKEN } from './config';
import { startGuild } from './helpers/guild';
import { logError } from './tools/logs';
import { checkMessage } from './helpers/messages';

const bot = new Client({
    intents: [
        'GuildBans',
        'GuildEmojisAndStickers',
        'GuildIntegrations',
        'GuildInvites',
        'GuildMembers',
        'GuildMessageReactions',
        'GuildMessageTyping',
        'GuildMessages',
        'GuildPresences',
        'GuildScheduledEvents',
        'GuildVoiceStates',
        'GuildWebhooks',
        'Guilds',
        'MessageContent'
    ]
});

bot.login(TOKEN);

bot.on('ready', () => startGuild());

bot.on('messageCreate', async message => checkMessage(message));
bot.on('messageUpdate', async (m, message) => {
    !message?.partial && checkMessage(message, true);
});

bot.on('error', error => {
    logError(error);
});
