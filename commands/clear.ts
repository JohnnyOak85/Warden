import { Message } from 'discord.js';
import { deleteMessages } from '../helpers/messages';
import { logError } from '../tools/logs';

module.exports = {
    name: 'clear',
    description: 'Clear a set amount of lines. From 1 up to 99.',
    usage: '<number of lines>',
    execute: async (message: Message, args: string[]) => {
        if (!message.member?.permissions.has('ManageMessages')) {
            message.channel.send('You do not have permission to delete messages.');
            return;
        }

        try {
            message.channel.send(await deleteMessages(message.channel.messages, args[0]));
        } catch (error) {
            logError(error);
        }
    }
};
