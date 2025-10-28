'use client';

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { 
    ReactFlow, 
    applyNodeChanges, 
    applyEdgeChanges, 
    addEdge, 
    type Node, 
    type Edge, 
    type NodeChange, 
    type Connection, 
    type EdgeChange, 
    Background,
    Controls,
    MiniMap,
    Panel
} from '@xyflow/react';
import { useState, useCallback } from 'react';

import '@xyflow/react/dist/style.css';
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";

export const EditorLoading = () => {
    return <LoadingView message='Loading editor...' />;
};

export const EditorError = () => {
    return <ErrorView message='Error loading editor' />
}

export const Editor = ({ workflowId}: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);

    const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow.edges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    return (
       <div className="size-full">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeComponents}
            fitView
        >
            <Background />
            <Controls  />
            <MiniMap />
            <Panel position="top-right">
                <AddNodeButton />
            </Panel>
        </ReactFlow>
       </div>
    );
};