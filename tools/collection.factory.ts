import { Collection } from 'discord.js';

export class CollectionFactory<T> {
  private collection: Collection<string, T>;

  constructor() {
    this.collection = new Collection<string, T>();
  }

  public addItem = (name: string, item: T) => this.collection.set(name, item);
  public getItem = (name: string) => this.collection.get(name);
  public deleteItem = (name: string) => this.collection.delete(name);
  public getList = () => this.collection.map((x) => x);
}
