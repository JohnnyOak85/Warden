import { Guild } from 'discord.js';
import moment from 'moment';
import { scheduleJob } from 'node-schedule';
import { buildEmbed } from '../discord/embeds';
import { findUser } from '../discord/members';
import { CollectionFactory } from './collection.factory';
import { listDocs } from './database';

const MIDNIGHT = '1 0 * * *';
const timers = new CollectionFactory<NodeJS.Timeout>();

export const getDate = (date = new Date(), timeFormat = 'Do MMMM YYYY, h:mm:ss a') => moment(date).format(timeFormat);
export const checkDate = (date: Date) => moment(date).isBefore(moment().format());

export const clearTimer = (id: string) => {
  const timer = timers.getItem(id);

  if (!timer) return;

  clearTimeout(timer);
  timers.deleteItem(id);
};

export const startTimers = async (guild: Guild) => {
  try {
    scheduleJob(MIDNIGHT, () => checkAnniversaries(guild));
  } catch (error) {
    throw error;
  }
};

const checkAnniversaries = async (guild: Guild) => {
  const userDocs = await listDocs(guild.id);

  for (const docPath of userDocs) {
    const user = await findUser(guild.id, docPath);

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
};
