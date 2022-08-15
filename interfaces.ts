import { GuildMember, Message } from 'discord.js';

export type StoredMember = PouchDB.Core.ExistingDocument<Member & PouchDB.Core.AllDocsMeta>;

export interface Dictionary<T> {
    [x: string]: T;
}

export type Action = (
    member: GuildMember,
    reply: string[],
    reason: string,
    amount?: string
) => void;

export interface Strikes {
    counter: number;
    timeout?: NodeJS.Timeout;
}

export interface Member {
    id?: string;
    infractions?: Dictionary<number>;
    strikes?: {
        counter: number;
        timeout: number;
    };
}

export interface Command {
    description: string;
    execute: (message: Message, args?: string[]) => void;
    game: boolean;
    moderation: boolean;
    name: string;
    usage: string;
}

export type Cleaner = (id: string, id2?: string) => Promise<void>;

export type TimerMap = Dictionary<NodeJS.Timeout>;
