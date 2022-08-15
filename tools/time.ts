import moment from 'moment';
import { Cleaner } from '../interfaces';

export const getDate = (date = new Date(), timeFormat = 'Do MMMM YYYY, h:mm:ss a') =>
    moment(date).format(timeFormat);

export const getTimer = (id: string, cb: Cleaner, timeout: number) =>
    setTimeout(() => cb(id), timeout);
