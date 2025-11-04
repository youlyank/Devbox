'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BlockType, BuilderNode, BuilderEdge } from '@/types/builder';
import { 
  Square, 
  Type, 
  FileText, 
  GitBranch, 
  Clock, 
  Bot, 
  Sparkles, 
  Globe, 
  Webhook 
} from 'lucide-react';

// Custom node component
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const { blockType, config } = data;
  const IconComponent = getIcon(blockType.icon);

  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[200px] ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <IconComponent className="w-4 h-4" />
        <span className="font-medium text-sm">{blockType.name}</span>
      </div>
      
      <div className="text-xs text-gray-500 mb-2">
        {blockType.description}
      </div>
      
      {/* Render input fields based on block type */}
      {blockType.type === 'ui' && (
        <div className="space-y-2">
          {blockType.id === 'ui-button' && (
            <Button size="sm" variant={config.variant || 'default'}>
              {config.text || 'Click me'}
            </Button>
          )}
          {blockType.id === 'ui-input' && (
            <Input 
              placeholder={config.placeholder || 'Enter text...'}
              value={config.value || ''}
              readOnly
              size="sm"
            />
          )}
          {blockType.id === 'ui-text' && (
            <p className="text-sm">{config.content || 'Hello World'}</p>
          )}
        </div>
      )}
      
      {blockType.type === 'ai' && (
        <div className="space-y-1">
          <div className="text-xs">
            Model: <span className="font-mono">{config.model || 'gpt-3.5-turbo'}</span>
          </div>
          {config.temperature && (
            <div className="text-xs">
              Temp: <span className="font-mono">{config.temperature}</span>
            </div>
          )}
        </div>
      )}
      
      {blockType.type === 'api' && (
        <div className="space-y-1">
          {config.url && (
            <div className="text-xs truncate">
              URL: <span className="font-mono">{config.url}</span>
            </div>
          )}
          {config.method && (
            <div className="text-xs">
              Method: <span className="font-mono">{config.method}</span>
            </div>
          )}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
      />
    </div>
  );
};

// Icon mapping
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Square,
    Type,
    FileText,
    GitBranch,
    Clock,
    Bot,
    Sparkles,
    Globe,
    Webhook,
  };
  return icons[iconName] || Square;
};

// Node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface BuilderCanvasProps {
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  onNodesChange: (nodes: BuilderNode[]) => void;
  onEdgesChange: (edges: BuilderEdge[]) => void;
  onConnect: (connection: Connection) => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => {
  const [reactFlowNodes, setReactFlowNodes, onNodesChangeHandler] = useNodesState(nodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChangeHandler] = useEdgesState(edges);

  // Convert our custom nodes to ReactFlow format
  const convertedNodes = useMemo(() => 
    nodes.map(node => ({
      ...node,
      type: 'custom',
    }))
  , [nodes]);

  const convertedEdges = useMemo(() => 
    edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
    }))
  , [edges]);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChangeHandler(changes);
    onNodesChange(reactFlowNodes);
  }, [reactFlowNodes, onNodesChange, onNodesChangeHandler]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeHandler(changes);
    onEdgesChange(reactFlowEdges);
  }, [reactFlowEdges, onEdgesChange, onEdgesChangeHandler]);

  const handleConnect = useCallback((connection: Connection) => {
    onConnect(connection);
  }, [onConnect]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={convertedNodes}
        edges={convertedEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};