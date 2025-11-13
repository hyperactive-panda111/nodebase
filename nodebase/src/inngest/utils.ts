import { Node, Connection } from '@/generated/prisma';
import toposort from 'toposort';

export const topologicalSort = (
    nodes: Node[],
    connections: Connection[],
): Node[] => {
    // If no connections, return the node array
    if (connections.length === 0) return nodes;

    //Create the edges array for toposort
    const edges: [string, string][] = connections.map((conn) => [
        conn.fromNodeId,
        conn.toNodeId,
    ]);

    //Add nodes with no connections to edges array as self-edges to ensure they're included
    const connectedNodeIds = new Set<string>();
    for (const conn of connections) {
        connectedNodeIds.add(conn.fromNodeId);
        connectedNodeIds.add(conn.toNodeId);
   }

    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            edges.push([node.id, node.id]);
        };
    };

    //Perfom topological sort
    let sortedNodeIds: string[];
    try {
        sortedNodeIds = toposort(edges);
        //Remove duplicate edges
        sortedNodeIds = [...new Set(sortedNodeIds)];
    } catch (error) {
        if (error instanceof Error && error.message.includes('Cyclic')) {
            throw new Error('Workflow contains a cycle');
        }
        throw error;
    }
    // Map sorted IDs back to node objects
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};
