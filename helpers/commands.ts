import { Message } from 'discord.js';
import { ensureDirSync, readdirSync } from 'fs-extra';
import { PREFIX } from '../config';
import { Command } from '../interfaces';
import { Collector } from '../storage/collection';
import { logError } from '../tools/logs';

const DIR = `${__dirname}/../commands`;

ensureDirSync(DIR);

const commands = new Collector<Command>();

export const setCommands = () => {
    for (const name of readdirSync(DIR)) {
        const command = require(`../commands/${name}`);
        commands.addItem(command.name, command);
    }
};

export const executeCommand = (message: Message) => {
    try {
        if (
            !message.content.startsWith(PREFIX) ||
            message.content[1] === PREFIX ||
            message.content.length < 2
        )
            return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
        const command = commands.getItem(args.shift()?.toLowerCase() || '');

        if (!command) {
            message.channel.send('That command does not exist.');
            return;
        }

        command.execute(message, args);
    } catch (error) {
        message.channel.send('There was an error trying to execute that command!');
        logError(error);
    }
};

export const getCommandsDescription = (verified: boolean) => {
    const reply = ['List of commands:'];

    for (const command of commands.getList()) {
        if (!verified && command.moderation) continue;

        reply.push(` * ${PREFIX}${command.name}`);
    }

    reply.push(`You can send \`${PREFIX}help [command name]\` to get info on a specific command!`);

    return reply.join('\n');
};

export const getCommandDescription = (name: string, verified: boolean) => {
    const command = commands.getItem(name);

    if (!verified) return 'You have no access to this command.';
    if (!command) return 'That command does not exist.';

    const reply = [`**Name:** ${command.name}`];
    reply.push(`**Description:** ${command.description}`);
    reply.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

    return reply.join('\n');
};
