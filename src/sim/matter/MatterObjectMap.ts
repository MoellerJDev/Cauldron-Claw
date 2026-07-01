import type Matter from 'matter-js';
import type { SimObject } from '../SimObject';

interface MatterObjectEntry {
  id: string;
  body: Matter.Body;
  object: SimObject;
}

export class MatterObjectMap {
  private readonly bodyById = new Map<string, Matter.Body>();
  private readonly idByBody = new WeakMap<Matter.Body, string>();
  private readonly objectById = new Map<string, SimObject>();

  set(id: string, body: Matter.Body, object: SimObject): void {
    this.bodyById.set(id, body);
    this.idByBody.set(body, id);
    this.objectById.set(id, object);
  }

  getBody(id: string): Matter.Body | undefined {
    return this.bodyById.get(id);
  }

  getId(body: Matter.Body): string | undefined {
    return this.idByBody.get(body);
  }

  getObject(id: string): SimObject | undefined {
    return this.objectById.get(id);
  }

  getObjectByBody(body: Matter.Body): SimObject | undefined {
    const id = this.getId(body);

    if (id === undefined) {
      return undefined;
    }

    return this.getObject(id);
  }

  entries(): readonly MatterObjectEntry[] {
    return [...this.bodyById.entries()].flatMap(([id, body]) => {
      const object = this.objectById.get(id);

      if (object === undefined) {
        return [];
      }

      return [{ id, body, object }];
    });
  }

  clear(): void {
    this.bodyById.clear();
    this.objectById.clear();
  }
}
