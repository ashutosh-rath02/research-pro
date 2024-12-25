import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';

export const MindMap: React.FC = () => {
  const { nodes, edges, addEdge: addEdgeToStore } = useStore();

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        id: `${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
      };
      addEdgeToStore(newEdge);
    },
    [addEdgeToStore]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};