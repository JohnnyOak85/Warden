import { ensureDir, ensureDirSync, readdirSync, readJSONSync, writeJSONSync } from 'fs-extra';

const DIR = './database';

ensureDir(DIR);

export const ensureDatabase = (dir: string) => ensureDirSync(`${DIR}/${dir}`);

export const getDoc = <T>(dir: string, doc: string) => {
  try {
    return readJSONSync(`${DIR}/${dir}/${doc}.json`) as T;
  } catch (error) {
    throw error;
  }
};

export const saveDoc = <T>(doc: T, dir: string, id: string) => {
  try {
    writeJSONSync(`${DIR}/${dir}/${id}.json`, doc);
  } catch (error) {
    throw error;
  }
};

export const docExists = (dir: string, doc: string) => {
  try {
    ensureDatabase(dir);

    const docs = listDocs(dir);

    if (!docs) return false;

    return docs.includes(doc);
  } catch (error) {
    throw error;
  }
};

export const listDocs = (dir: string) => {
  try {
    const docs = readdirSync(`${DIR}/${dir}`);

    return docs.map((file) => file.replace('.json', ''));
  } catch (error) {
    throw error;
  }
};

export const updateDoc = <T>(doc: T, dir: string, id: string) => {
  try {
    saveDoc(Object.assign(getDoc<T>(dir, id), doc), dir, id);
  } catch (error) {
    throw error;
  }
};

export const findDoc = <T>(dir: string, doc: string) => {
  try {
    if (!docExists(dir, doc)) return;

    return getDoc<T>(dir, doc);
  } catch (error) {
    throw error;
  }
};
