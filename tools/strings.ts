import { getMap } from './data';
import { getDoc } from './database';

const cleanString = async (str: string) => {
  const chars = await getDoc<string[]>('configurations', 'chars');

  for (const char of chars) {
    const regex = new RegExp(`\\${char}`, 'g');

    str = str.replace(regex, ' ');
  }

  return str;
};

export const getReason = (reason: string) => (reason ? `Reason: ${reason}` : 'No reason provided');

export const getReply = async (message: string, file: string) => {
  message = await cleanString(message);

  const map = await getMap<string>(file);
  const words = message.split(' ');

  for (const word of words) {
    const specialIndex = `${word} ${words[words.indexOf(word) + 1]}`;

    if (map[word]) {
      return map[word];
    } else if (map[specialIndex]) {
      return map[specialIndex];
    }
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
