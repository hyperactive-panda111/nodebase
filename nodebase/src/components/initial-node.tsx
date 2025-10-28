'use client';

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useState } from 'react';
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./workflow-node";

export const InitialNode = memo((props: NodeProps) => {
    return (
        <WorkflowNode>
            <PlaceholderNode {...props}>
                <div className="cursor-pointer flex items-center justify-center">
                    <PlusIcon className="size-4" />
                </div>
            </PlaceholderNode>
        </WorkflowNode>
    );
});

InitialNode.displayName = "InitialNode";