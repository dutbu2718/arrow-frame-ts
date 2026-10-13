import type { NodeId, Node } from "./types";

/**
 * @description
 * A DAG.
 */
export class Graph {
  readonly nodes = new Map<NodeId, Node>();

  add(id: NodeId) {
    if (this.nodes.has(id)) {
      return;
    }

    const node: Node = {
      id: id,
      upstream: new Set(),
      downstream: new Set(),
      dirty: true,
    };

    this.nodes.set(id, node);

    return node;
  }

  get(id: NodeId): Node {
    const node = this.nodes.get(id);

    if (!node) {
      throw new Error(`Node ${id} does not exists`);
    }

    return node;
  }

  has(id: NodeId): boolean {
    return this.nodes.has(id);
  }

  isDirty(id: NodeId): boolean {
    return this.get(id).dirty;
  }

  connect(a: NodeId, b: NodeId): void {
    const nodeA = this.get(a);
    const nodeB = this.get(b);

    const stack = [b];
    const visited = new Set<NodeId>();

    while (stack.length > 0) {
      const id = stack.pop()!;

      if (id === a) {
        throw new Error(`Circular dependency: ${a} → ${b}`);
      }

      if (visited.has(id)) {
        continue;
      }

      visited.add(id);

      for (const next of this.get(id).downstream) {
        stack.push(next);
      }
    }

    nodeA.downstream.add(b);
    nodeB.upstream.add(a);
  }

  setDirty(id: NodeId, dirty: boolean): NodeId[] {
    const stack = [this.get(id)];
    const visited = new Set<NodeId>();

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (visited.has(node.id)) {
        continue;
      }

      visited.add(node.id);
      node.dirty = dirty;

      for (const id of node.downstream) {
        stack.push(this.get(id));
      }
    }

    return Array.from(visited);
  }
}
