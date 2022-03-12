import { getConfig, getConfigMap } from './configurations';
import { getRandom } from './math';

const cleanString = (str: string) => {
  try {
    const chars = getConfig<string[]>('chars');

    for (const char of chars) {
      const regex = new RegExp(`\\${char}`, 'g');

      str = str.replace(regex, ' ');
    }

    return str;
  } catch (error) {
    throw error;
  }
};

export const getReason = (reason: string) => (reason ? `Reason: ${reason}` : 'No reason provided');

export const getReply = (message: string, file: string) => {
  try {
    const clean = cleanString(message);

    message = clean ? clean : message;

    const map = getConfigMap<string>(file);
    const words = message.split(' ');

    for (const word of words) {
      const specialIndex = `${word} ${words[words.indexOf(word) + 1]}`;

      if (map[word]) {
        return map[word];
      } else if (map[specialIndex]) {
        return map[specialIndex];
      }
    }
  } catch (error) {
    throw error;
  }
};

export const checkCaps = (str: string) => {
  let counter = 0;

  if (str.length < 60) return;

  for (const char of str) {
    if (char === char.toUpperCase()) counter++;
  }

  if (counter >= 60) return true;
};

export const checkRepeatedWords = (str: string) => {
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
};

export const getResponse = (block: string, defaultResponse: string) => {
  try {
    const config = getConfigMap<string[]>('responses');

    return config[block][getRandom(config[block].length) - 1];
  } catch (error) {
    return defaultResponse;
  }
};
