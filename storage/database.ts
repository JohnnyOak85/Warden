import PouchDB from 'pouchdb';
import { DB_ADDRESS } from '../config';
import { Dictionary } from '../interfaces';

const db = new PouchDB(`${DB_ADDRESS}/artemis`);

export const getAllDocs = async <T>() => {
    try {
        const list = await db.allDocs<T>({ include_docs: true });

        return list.rows.map(row => row.doc).filter(doc => doc);
    } catch (error) {
        throw error;
    }
};

export const getDoc = async <T>(id: string) => {
    const doc = await db.get<T>(id);
    const clone = JSON.parse(JSON.stringify(doc));

    delete clone._id;
    delete clone._rev;

    return clone as T;
};

export const saveDoc = async <T>(docId: string, map: T) => {
    const doc = await db.get<T>(docId);

    db.put(Object.assign(doc, map));
};

export const appendDocList = async (docId: string, entry: string) => {
    try {
        const doc = await db.get<Dictionary<string[]>>(docId);

        doc[docId].push(entry);

        db.put(doc);
    } catch (error) {
        throw error;
    }
};
