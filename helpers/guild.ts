import { setCommands } from './commands';
import { logError, logInfo } from '../tools/logs';
import { setMembers } from './members';

export const startGuild = () => {
    try {
        setCommands();
        setMembers();
        logInfo('Bot is online!');
        console.log('ONLINE');
    } catch (error) {
        logError(error);
    }
};
