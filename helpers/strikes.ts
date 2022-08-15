import { Collector } from '../storage/collection';
import { Member, Strikes } from '../interfaces';
import { logError } from '../tools/logs';
import { saveDoc } from '../storage/database';
import { getTimer } from '../tools/time';

const strikes = new Collector<Strikes>();

const getTimeout = () => new Date().setDate(new Date().getDate() + 7);
const getStrikes = (id: string) => strikes.getItem(id) || { counter: 0 };

export const getStrikeCount = (id: string) => getStrikes(id).counter;

const cleanStrike = async (id: string) => {
    try {
        const entry = strikes.getItem(id);
        const timeout = getTimeout();

        if (!entry) return;

        if (entry.counter === 0) {
            clearTimeout(entry.timeout);
            strikes.deleteItem(id);
        } else {
            entry.counter -= 1;
            entry.timeout = getTimer(id, cleanStrike, timeout);
        }

        saveDoc<Member>(id, {
            strikes: { counter: entry.counter, timeout: entry.counter ? timeout : 0 }
        });
    } catch (error) {
        logError(error);
    }
};

export const addStrike = async (id: string) => {
    const memberStrikes = getStrikes(id);
    const timeout = getTimeout();

    if (memberStrikes.counter === 0) {
        memberStrikes.timeout = getTimer(id, cleanStrike, timeout);
        strikes.addItem(id, memberStrikes);
    }

    memberStrikes.counter += 1;

    saveDoc(id, { strikes: memberStrikes });
};

export const setStrikes = async (memberId: string, member: Member) => {
    try {
        if (!member.strikes?.counter || !member.strikes.timeout) return;

        strikes.addItem(memberId, {
            counter: member.strikes?.counter,
            timeout: getTimer(memberId, cleanStrike, member.strikes?.timeout)
        });
    } catch (error) {
        throw error;
    }
};
