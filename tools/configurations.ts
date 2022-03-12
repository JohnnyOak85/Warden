import { ensureDirSync, readJSONSync } from 'fs-extra';

export interface DataMap<T> {
  [x: string]: T;
}

const DIR = './configurations';

ensureDirSync(DIR);

export const getConfig = <T>(config: string) => {
  try {
    return readJSONSync(`${DIR}/${config}.json`) as T;
  } catch (error) {
    throw error;
  }
};

export const getConfigMap = <T>(config: string) => {
  try {
    return readJSONSync(`${DIR}/${config}.json`) as DataMap<T>;
  } catch (error) {
    throw error;
  }
};
