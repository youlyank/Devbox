'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Terminal,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Database
} from 'lucide-react';
import { BuilderNode, BuilderEdge } from '@/types/builder';

interface SimulationEvent {
  id: string;
  nodeId: string;
  nodeName: string;
  type: 'start' | 'success' | 'error' | 'data';
  message: string;
  data?: any;
  timestamp: Date;
  duration?: number;
}

interface WorkflowSimulatorProps {
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  isOpen: boolean;
  onToggle: () => void;
}

export const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({
  nodes,
  edges,
  isOpen,
  onToggle,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState(0);
  const [results, setResults] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setExecutionTime(prev => prev + 100);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const addEvent = (event: Omit<SimulationEvent, 'id' | 'timestamp'>) => {
    const newEvent: SimulationEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const simulateNode = async (node: BuilderNode): Promise<any> => {
    setCurrentNode(node.id);
    addEvent({
      nodeId: node.id,
      nodeName: node.data.label,
      type: 'start',
      message: `Executing ${node.data.blockType.name}...`,
    });

    const startTime = Date.now();

    try {
      let result;

      switch (node.data.blockType.type) {
        case 'ui':
          result = await simulateUIBlock(node);
          break;
        case 'logic':
          result = await simulateLogicBlock(node);
          break;
        case 'ai':
          result = await simulateAIBlock(node);
          break;
        case 'api':
          result = await simulateAPIBlock(node);
          break;
        default:
          result = { success: true, data: 'Default result' };
      }

      const duration = Date.now() - startTime;

      addEvent({
        nodeId: node.id,
        nodeName: node.data.label,
        type: 'success',
        message: `✓ ${node.data.blockType.name} completed successfully`,
        data: result,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      addEvent({
        nodeId: node.id,
        nodeName: node.data.label,
        type: 'error',
        message: `✗ ${node.data.blockType.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
      });

      throw error;
    }
  };

  const simulateUIBlock = async (node: BuilderNode) => {
    // Simulate UI interaction
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch (node.data.blockType.id) {
      case 'ui-button':
        return { action: 'click', timestamp: new Date().toISOString() };
      case 'ui-input':
        return { value: node.data.config.value || 'sample input', timestamp: new Date().toISOString() };
      case 'ui-text':
        return { displayed: true, content: node.data.config.content };
      default:
        return { success: true };
    }
  };

  const simulateLogicBlock = async (node: BuilderNode) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    switch (node.data.blockType.id) {
      case 'logic-condition':
        const condition = Math.random() > 0.5;
        return { condition, branch: condition ? 'true' : 'false' };
      case 'logic-delay':
        const delay = node.data.config.duration || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return { delayed: true, duration: delay };
      default:
        return { success: true };
    }
  };

  const simulateAIBlock = async (node: BuilderNode) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    switch (node.data.blockType.id) {
      case 'ai-chat':
        return {
          response: 'This is a simulated AI response. In production, this would connect to the actual AI service.',
          model: node.data.config.model || 'gpt-3.5-turbo',
          tokens: 150,
        };
      case 'ai-generate':
        return {
          generated: 'This is simulated generated content.',
          model: node.data.config.model || 'gpt-3.5-turbo',
          tokens: 200,
        };
      default:
        return { success: true };
    }
  };

  const simulateAPIBlock = async (node: BuilderNode) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (node.data.blockType.id) {
      case 'api-request':
        return {
          status: 200,
          data: { message: 'Simulated API response', timestamp: new Date().toISOString() },
          headers: { 'content-type': 'application/json' },
        };
      case 'api-webhook':
        return {
          received: true,
          data: { event: 'webhook', payload: 'sample data' },
        };
      default:
        return { success: true };
    }
  };

  const findExecutionOrder = () => {
    // Simple topological sort for execution order
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Find incoming edges
      const incomingEdges = edges.filter(e => e.target === nodeId);
      for (const edge of incomingEdges) {
        visit(edge.source);
      }
      
      order.push(nodeId);
    };
    
    nodes.forEach(node => visit(node.id));
    return order;
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setEvents([]);
    setCurrentNode(null);
    setExecutionTime(0);
    setResults(null);
    startTimeRef.current = new Date();

    try {
      const executionOrder = findExecutionOrder();
      const finalResults: any = {};

      for (const nodeId of executionOrder) {
        if (!isRunning || isPaused) break;
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        const result = await simulateNode(node);
        finalResults[nodeId] = result;

        // Simulate data flow between connected nodes
        const outgoingEdges = edges.filter(e => e.source === nodeId);
        for (const edge of outgoingEdges) {
          addEvent({
            nodeId: edge.target,
            nodeName: nodes.find(n => n.id === edge.target)?.data.label || 'Unknown',
            type: 'data',
            message: `Data flow: ${node.data.label} → ${nodes.find(n => n.id === edge.target)?.data.label}`,
            data: { from: nodeId, to: edge.target, result },
          });
        }
      }

      setResults(finalResults);
      addEvent({
        nodeId: 'workflow',
        nodeName: 'Workflow',
        type: 'success',
        message: '🎉 Workflow execution completed successfully!',
      });

    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsRunning(false);
      setCurrentNode(null);
    }
  };

  const stopSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentNode(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const pauseSimulation = () => {
    setIsPaused(!isPaused);
  };

  const resetSimulation = () => {
    stopSimulation();
    setEvents([]);
    setExecutionTime(0);
    setResults(null);
    setCurrentNode(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-96 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Workflow Simulator</h3>
              </div>
              <Badge variant={isRunning ? 'default' : 'secondary'}>
                {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Ready'}
              </Badge>
              {executionTime > 0 && (
                <span className="text-sm text-gray-600">
                  {Math.floor(executionTime / 1000)}s {(executionTime % 1000).toString().padStart(3, '0')}ms
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button onClick={runSimulation} size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              ) : (
                <>
                  <Button onClick={pauseSimulation} size="sm" variant="outline">
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={stopSimulation} size="sm" variant="outline">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
              <Button onClick={resetSimulation} size="sm" variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={onToggle} size="sm" variant="ghost">
                ×
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Events Log */}
          <div className="flex-1 border-r border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <h4 className="font-medium text-sm">Execution Log</h4>
            </div>
            <ScrollArea className="h-64 p-3">
              <div className="space-y-2">
                {events.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Click "Run" to start simulation...</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-start gap-2 text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        {event.type === 'start' && <Clock className="w-3 h-3 text-blue-500" />}
                        {event.type === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                        {event.type === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
                        {event.type === 'data' && <Zap className="w-3 h-3 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{event.nodeName}</div>
                        <div className="text-gray-600">{event.message}</div>
                        {event.duration && (
                          <div className="text-xs text-gray-500">{event.duration}ms</div>
                        )}
                        {event.data && (
                          <details className="text-xs text-gray-500 mt-1">
                            <summary className="cursor-pointer">Data</summary>
                            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Results */}
          <div className="w-80">
            <div className="p-3 border-b border-gray-200">
              <h4 className="font-medium text-sm">Results</h4>
            </div>
            <div className="p-3">
              {results ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Execution completed</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {Object.keys(results).length} nodes executed
                  </div>
                  <details className="mt-2">
                    <summary className="text-sm font-medium cursor-pointer">Final Results</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-48">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Results will appear here after execution</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};