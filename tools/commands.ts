import { Message } from 'discord.js';
import { readdirSync } from 'fs-extra';
import { PREFIX } from '../config';
import { CollectionFactory } from './collection.factory';

const commands = new CollectionFactory<{
  description: string;
  execute: (message: Message, args?: string[]) => void;
  game: boolean;
  moderation: boolean;
  name: string;
  usage: string;
}>();

export const setCommands = () => {
  for (const name of readdirSync(`${__dirname}/../commands`)) {
    const command = require(`../commands/${name}`);
    commands.addItem(command.name, command);
  }
};

export const executeCommand = async (message: Message) => {
  try {
    if (!message.content.startsWith(PREFIX) || message.content[1] === PREFIX || message.content.length < 2) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = commands.getItem(args.shift()?.toLowerCase() || '');

    if (!command) return 'That command does not exist.';

    command.execute(message, args);
  } catch (error) {
    message.channel.send('There was an error trying to execute that command!');
  }
};
