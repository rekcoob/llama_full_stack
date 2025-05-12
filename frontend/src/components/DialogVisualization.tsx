// DialogVisualization.tsx
import React from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
} from '@xyflow/react'

interface DialogVisualizationProps {
  nodes: Node[]
  edges: Edge[]
  toggleCollapse: (nodeId: string) => void
}

const DialogVisualization: React.FC<DialogVisualizationProps> = ({
  nodes,
  edges,
  toggleCollapse,
}) => {
  return (
    <div
      style={{ height: 600, border: '1px solid #ccc' }}
      onClick={(e) => {
        const target = e.target as HTMLElement
        const nodeId = target.closest('[data-id]')?.getAttribute('data-id')
        if (nodeId) {
          toggleCollapse(nodeId)
        }
      }}
    >
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}

export default DialogVisualization
