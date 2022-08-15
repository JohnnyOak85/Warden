import { Message, MessageManager } from 'discord.js';
import { BOT_ID } from '../config';
import { executeCommand } from './commands';
import { logError } from '../tools/logs';
import { getNumber } from '../tools/math';
import { hasSpam } from './spam';

export const findMessageByContent = async (manager: MessageManager, content: string) => {
    try {
        const list = await manager.fetch();
        return list.find(m => m.content.includes(content));
    } catch (error) {
        throw error;
    }
};

export const filterMessages = async (manager: MessageManager, id: string) => {
    try {
        const list = await manager.fetch({ limit: 25 });

        return list.filter(message => message.author.id === id);
    } catch (error) {
        throw error;
    }
};

export const isOwnMessage = async (manager: MessageManager, reply: string, id: string) => {
    try {
        const list = await filterMessages(manager, BOT_ID);

        if (!list) return false;

        return !!list.find(
            message => message.content.includes(reply) && message.content.includes(id)
        );
    } catch (error) {
        throw error;
    }
};

export const checkMessage = async (message: Message, update = false) => {
    if (!message || message.channel.isDMBased() || message.author.bot) return;

    try {
        hasSpam(message);

        if (!update) {
            executeCommand(message);
        }
    } catch (error) {
        logError(error);
    }
};

export const deleteMessages = async (manager: MessageManager, amount: string) => {
    try {
        const limit = (getNumber(amount) || 1) + 1;
        const list = await manager.fetch({ limit });

        list.forEach(m => m.delete());

        return `Deleted ${limit - 1} message${limit - 1 > 1 ? 's' : ''}!`;
    } catch (error) {
        throw error;
    }
};
