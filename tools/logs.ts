import { createLogger, format, transports } from 'winston';
import { getDate } from './time';

const logger = createLogger({
    level: 'info',
    format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
    defaultMeta: { service: 'user-service' },
    transports: [new transports.File({ filename: 'logs/log.txt' })]
});

export const logError = (error: any) => logger.log('error', JSON.stringify(error));
export const logInfo = (message: string) => logger.log('info', `${message}\nTime: ${getDate()}`);
