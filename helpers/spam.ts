import { ChannelType, Message } from 'discord.js';
import { TIMEOUT_MIN } from '../config';
import { filterMessages, isOwnMessage } from './messages';
import { addStrike, getStrikeCount } from './strikes';

const checkCaps = (str: string) => {
    let counter = 0;

    if (str.length < 60) return false;

    for (const char of str) {
        if (char === char.toUpperCase()) counter++;
    }

    if (counter >= 60) return true;

    return false;
};

const checkRepeatedWords = (str: string) => {
    const words = str
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/\s{2,}/g, ' ')
        .split(' ');

    for (const firstWord of words) {
        let counter = 0;

        if (firstWord.length < 3) continue;

        for (const secondWord of words) {
            if (firstWord.toLowerCase() === secondWord.toLowerCase()) counter++;

            if (words.length > 5 && counter >= words.length / 2) return true;
        }
    }

    return false;
};

const checkPings = (pings: number) => pings >= 3;

const checkRepeatedMessages = async (message: Message) => {
    try {
        const list = await filterMessages(message.channel.messages, message.author.id);

        if (!list) return false;

        return (
            list
                .filter(repeat => repeat.id !== message.id && repeat.content === message.content)
                .map(x => x).length >= 3
        );
    } catch (error) {
        throw error;
    }
};

const checkSpam = async (message: Message) => {
    try {
        if (checkPings(message.mentions.users.size)) {
            return 'Too many pings!';
        }

        if (checkCaps(message.content.replace(/[^\w]/g, ''))) {
            return 'No shouting!';
        }

        if (checkRepeatedWords(message.content) || (await checkRepeatedMessages(message))) {
            return 'No spammming!';
        }
    } catch (error) {
        throw error;
    }
};

export const hasSpam = async (message: Message) => {
    try {
        if (
            !message.member ||
            message.member?.permissions.has('ManageMessages') ||
            message.channel.type !== ChannelType.GuildText ||
            !message.content
        )
            return;

        const reply = await checkSpam(message);

        if (!reply) return;

        message.delete();

        if (await isOwnMessage(message.channel.messages, reply, message.author.id)) return;

        addStrike(message.author.id);
        const strikes = getStrikeCount(message.author.id);

        if (strikes > 1) {
            message.member.timeout(TIMEOUT_MIN * (strikes - 1) * 60 * 1000, reply);
        }

        message.reply(reply);
    } catch (error) {
        throw error;
    }
};
