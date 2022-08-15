import { setCommands } from './commands';
import { logError, logInfo } from '../tools/logs';
import { setMembers } from './members';
import { startDatabase } from '../storage/database';

export const startGuild = async () => {
    try {
        setCommands();
        await startDatabase();
        setMembers();
        logInfo('Bot is online!');

        console.log('ONLINE');
    } catch (error) {
        logError(error);
    }
};
