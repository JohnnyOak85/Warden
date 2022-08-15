import PouchDB from 'pouchdb';
import { DB_ADDRESS } from '../config';
import { Member, StoredMember } from '../interfaces';

const db = new PouchDB(`${DB_ADDRESS}/members`);

const cleanDoc = (doc: StoredMember): Member => ({
    id: doc._id,
    infractions: doc.infractions,
    strikes: doc.strikes
});

const getDocs = async () => await db.allDocs<Member>({ include_docs: true });
const parseDocs = async () => (await getDocs()).rows.map(row => row.doc).filter(doc => doc);

export const getMemberList = async () =>
    (await parseDocs())
        .map(doc => {
            if (doc) {
                return cleanDoc(doc);
            }
        })
        .filter(doc => doc);

export const getMember = async (id: string) => cleanDoc(await db.get<Member>(id));
export const saveMember = async (id: string, member: Member) =>
    db.put(Object.assign(await db.get(id), member));

export const startDatabase = () => db.info();
