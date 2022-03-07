import { ensureDir, readdir, readJSON, writeJSON } from 'fs-extra';
import { DATABASE_DIR } from '../config';

export const ensureDatabase = (guild: string) => ensureDir(`${DATABASE_DIR}/${guild}`);
export const getDoc = <T>(dir: string, doc: string): Promise<T> => readJSON(`${DATABASE_DIR}/${dir}/${doc}.json`);
export const saveDoc = <T>(doc: T, dir: string, id: string) => writeJSON(`${DATABASE_DIR}/${dir}/${id}.json`, doc);
export const docExists = (dir: string, doc: string) => listDocs(dir).then((dir) => dir.includes(doc));
export const listDocs = (dir: string) => readdir(`${DATABASE_DIR}/${dir}`).then((d) => d.map((file) => file.replace('.json', '')));
export const updateDoc = <T>(doc: T, dir: string, id: string) => getDoc(dir, id).then((d) => saveDoc(Object.assign(d, doc), dir, id));
export const findDoc = <T>(dir: string, doc: string) => docExists(dir, doc).then((bool) => (bool ? getDoc<T>(dir, doc) : undefined));

ensureDir(DATABASE_DIR);
