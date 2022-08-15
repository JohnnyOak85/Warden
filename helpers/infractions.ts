import { Collector } from '../storage/collection';
import { Dictionary, Member, TimerMap } from '../interfaces';
import { logError } from '../tools/logs';
import { saveDoc, getDoc } from '../storage/database';
import { getTimer } from '../tools/time';

const infractions = new Collector<TimerMap>();

const getTimeout = () => new Date().setMonth(new Date().getMonth() + 6);
const getInfractions = (id: string) => infractions.getItem(id) || {};

const cleanInfraction = async (id: string, id2 = '') => {
    try {
        const entry = infractions.getItem(id);

        if (!entry || !entry[id2]) return;

        clearTimeout(entry[id2]);
        delete entry[id2];

        const memberDoc = await getDoc<Member>(id);

        if (memberDoc.infractions) {
            delete memberDoc.infractions[id2];
            saveDoc(id, memberDoc);
        }
    } catch (error) {
        logError(error);
    }
};

const saveInfractions = async (id: string, infraction: Dictionary<number>) => {
    try {
        const doc = await getDoc<Member>(id);

        doc.infractions = Object.assign(doc.infractions || {}, infraction);

        saveDoc(id, doc);
    } catch (error) {
        throw error;
    }
};

export const addInfraction = async (id: string, reason: string) => {
    try {
        const memberInfractions = getInfractions(id);
        const timeout = getTimeout();

        memberInfractions[reason] = getTimer(id, cleanInfraction, timeout);

        infractions.addItem(id, memberInfractions);

        saveInfractions(id, { [reason]: timeout });
    } catch (error) {
        throw error;
    }
};

export const setInfractions = async (memberId: string, member: Member) => {
    try {
        if (!member.infractions) return;

        const memberInfractions: TimerMap = {};

        for (const infraction in member.infractions) {
            memberInfractions[infraction] = getTimer(
                memberId,
                cleanInfraction,
                member.infractions[infraction]
            );
        }

        infractions.addItem(memberId, memberInfractions);
    } catch (error) {
        throw error;
    }
};
