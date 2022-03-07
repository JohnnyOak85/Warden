import { getDoc, saveDoc } from './database';

export interface DataMap<T> {
  [x: string]: T;
}

const checkReactions = (emoji: string, count: number) =>
  getMap<number | string>('config').then((config) => (count < config.REACTION_TOTAL || emoji !== config.QUOTE_REACTION ? false : true));
const updateQuotes = (quote: string) => getDoc<string[]>('', 'quotes').then((quotes) => saveDoc(quotes.push(quote), '', 'quotes'));
export const getMap = <T>(name: string) => getDoc<DataMap<T>>('configurations', name);
export const recordMap = (map: DataMap<string>[], doc: string) => saveDoc(map, 'configurations', doc);
export const recordQuote = (emoji: string, count: number, quote: string) =>
  checkReactions(emoji, count).then((bool) => (bool ? updateQuotes(quote) : undefined));
