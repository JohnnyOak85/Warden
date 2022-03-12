import { Guild } from 'discord.js';
import moment from 'moment';
import { scheduleJob } from 'node-schedule';
import { buildEmbed } from '../discord/embeds';
import { findUser } from '../discord/members';
import { CollectionFactory } from './collection.factory';
import { listDocs } from './database';
import { logError } from './logs';

const MIDNIGHT = '1 0 * * *';
const timers = new CollectionFactory<NodeJS.Timeout>();

export const getDate = (date = new Date(), timeFormat = 'Do MMMM YYYY, h:mm:ss a') => {
  try {
    return moment(date).format(timeFormat);
  } catch (error) {
    throw error;
  }
};

const checkDate = (date: Date) => {
  try {
    return moment(date).isBefore(moment().format());
  } catch (error) {
    throw error;
  }
};

export const clearTimer = (id: string) => {
  try {
    const timer = timers.getItem(id);

    if (!timer) return;

    clearTimeout(timer);
    timers.deleteItem(id);
  } catch (error) {
    throw error;
  }
};

export const startTimers = async (guild: Guild) => {
  try {
    scheduleJob(MIDNIGHT, () => checkAnniversaries(guild));
  } catch (error) {
    logError(error);
  }
};

const checkAnniversaries = (guild: Guild) => {
  try {
    const userDocs = listDocs(guild.id);

    for (const docPath of userDocs) {
      const user = findUser(guild.id, docPath);

      if (!user?.anniversary || user.removed || checkDate(user.anniversary)) continue;

      const guildUser = guild.members.cache.get(user.id || '');

      if (!guildUser || !guild.systemChannel) continue;

      const embed = buildEmbed({
        color: 'RANDOM',
        title: 'HAPPY ANNIVERSARY!',
        thumb: guildUser.user.avatarURL(),
        url: 'https://www.youtube.com/watch?v=8zgz2xBrvVQ'
      });

      embed.addField(`It's ${guildUser.nickname}'s anniversary!`, 'Everyone party!');

      guild.systemChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    logError(error);
  }
};
