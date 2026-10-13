export type NodeId = string;

export interface Node {
  readonly id: NodeId;
  readonly upstream: Set<NodeId>;
  readonly downstream: Set<NodeId>;
  dirty: boolean;
}
