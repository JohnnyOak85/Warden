import { getConfigMap } from './configurations';
import { docExists, getDoc, saveDoc } from './database';
import { getRandom } from './math';

const checkReactions = (emoji: string, count: number) => {
  try {
    const config = getConfigMap<number | string>('main');

    return count < config.REACTION_TOTAL || emoji !== config.QUOTE_REACTION ? false : true;
  } catch (error) {
    throw error;
  }
};

const updateQuotes = (quote: string, guild: string) => {
  try {
    if (!docExists(guild, 'quotes')) {
      saveDoc([quote], guild, 'quotes');
    } else {
      const quotes = getDoc<string[]>(guild, 'quotes');

      quotes.push(quote);

      saveDoc(quotes, guild, 'quotes');
    }
  } catch (error) {
    throw error;
  }
};

export const recordQuote = (emoji: string, count: number, quote: string, guild: string) => {
  try {
    if (!checkReactions(emoji, count)) return;

    updateQuotes(quote, guild);
  } catch (error) {
    throw error;
  }
};

export const getQuote = (guild: string) => {
  try {
    if (!docExists(guild, 'quotes')) {
      saveDoc([], guild, 'quotes');
    }

    const quotes = getDoc<string[]>(guild, 'quotes');

    if (!quotes.length) {
      return 'I have no recorded quotes';
    }

    return quotes[getRandom(quotes.length) - 1];
  } catch (error) {
    throw error;
  }
};
