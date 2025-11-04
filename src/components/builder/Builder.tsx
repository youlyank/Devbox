'use client';

import React, { useState, useCallback } from 'react';
import { BuilderCanvas } from './BuilderCanvas';
import { BlockPalette } from '../BlockPalette';
import { AICoBuilder } from '../ai/AICoBuilder';
import { WorkflowSimulator } from '../simulation/WorkflowSimulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Save, 
  Settings, 
  Download, 
  Upload,
  Bot,
  Sparkles,
  Terminal,
  GitBranch,
  Users,
  Zap
} from 'lucide-react';
import { BlockType, BuilderNode, BuilderEdge } from '@/types/builder';

interface BuilderProps {
  projectId?: string;
  initialNodes?: BuilderNode[];
  initialEdges?: BuilderEdge[];
  onSave?: (project: any) => void;
  onDeploy?: (project: any) => void;
}

export const Builder: React.FC<BuilderProps> = ({
  projectId = 'demo-project',
  initialNodes = [],
  initialEdges = [],
  onSave,
  onDeploy,
}) => {
  const [nodes, setNodes] = useState<BuilderNode[]>(initialNodes);
  const [edges, setEdges] = useState<BuilderEdge[]>(initialEdges);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [projectDescription, setProjectDescription] = useState('');
  const [isAISuggestionOpen, setIsAISuggestionOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAICoBuilderOpen, setIsAICoBuilderOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [collaborators, setCollaborators] = useState(0);

  const handleBlockSelect = useCallback((blockType: BlockType) => {
    const newNode: BuilderNode = {
      id: `node-${Date.now()}`,
      type: blockType.id,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: blockType.name,
        blockType,
        config: { ...blockType.config },
      },
    };
    
    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleNodesChange = useCallback((newNodes: BuilderNode[]) => {
    setNodes(newNodes);
  }, []);

  const handleEdgesChange = useCallback((newEdges: BuilderEdge[]) => {
    setEdges(newEdges);
  }, []);

  const handleConnect = useCallback((connection: any) => {
    const newEdge: BuilderEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    };
    setEdges(prev => [...prev, newEdge]);
  }, []);

  const handleAddNodes = useCallback((newNodes: BuilderNode[]) => {
    setNodes(prev => [...prev, ...newNodes]);
  }, []);

  const handleAddEdges = useCallback((newEdges: BuilderEdge[]) => {
    setEdges(prev => [...prev, ...newEdges]);
  }, []);

  const handleSave = useCallback(async () => {
    const project = {
      id: projectId,
      name: projectName,
      description: projectDescription,
      config: {
        nodes,
        edges,
        blocks: {},
      },
      version: currentVersion,
    };
    
    if (onSave) {
      onSave(project);
    }
    
    // Save to localStorage for persistence
    localStorage.setItem(`builder-project-${projectId}`, JSON.stringify(project));
    
    // TODO: Save version to database
    console.log('Saving version:', currentVersion);
  }, [projectId, projectName, projectDescription, nodes, edges, currentVersion, onSave]);

  const handleDeploy = useCallback(() => {
    const project = {
      id: projectId,
      name: projectName,
      description: projectDescription,
      config: {
        nodes,
        edges,
        blocks: {},
      },
    };
    
    if (onDeploy) {
      onDeploy(project);
    }
  }, [projectId, projectName, projectDescription, nodes, edges, onDeploy]);

  const handleCreateVersion = useCallback(() => {
    const newVersion = `${parseInt(currentVersion.split('.')[0]) + 1}.0.0`;
    setCurrentVersion(newVersion);
    
    // TODO: Create version in database
    console.log('Creating version:', newVersion);
  }, [currentVersion]);

  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentNodes: nodes,
          currentEdges: edges,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.nodes) {
        setNodes(result.nodes);
        if (result.edges) {
          setEdges(result.edges);
        }
        setIsAISuggestionOpen(false);
        setAiPrompt('');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  }, [aiPrompt, nodes, edges]);

  const handleExport = useCallback(() => {
    const project = {
      name: projectName,
      description: projectDescription,
      config: {
        nodes,
        edges,
      },
      version: currentVersion,
    };
    
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-v${currentVersion}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [projectName, projectDescription, nodes, edges, currentVersion]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string);
        setProjectName(project.name || 'Imported Project');
        setProjectDescription(project.description || '');
        setNodes(project.config?.nodes || []);
        setEdges(project.config?.edges || []);
        setCurrentVersion(project.version || '1.0.0');
      } catch (error) {
        console.error('Failed to import project:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                placeholder="Project Name"
              />
              <Input
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="text-sm text-gray-500 border-none p-0 h-auto focus-visible:ring-0 mt-1"
                placeholder="Project Description"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {nodes.length} blocks
              </Badge>
              <Badge variant="outline">
                v{currentVersion}
              </Badge>
              {collaborators > 0 && (
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {collaborators}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAICoBuilderOpen(!isAICoBuilderOpen)}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Co-Builder
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            >
              <Terminal className="w-4 h-4 mr-2" />
              {isSimulatorOpen ? 'Hide' : 'Show'} Simulator
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateVersion}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Save Version
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-input')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <input
              id="import-input"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button
              size="sm"
              onClick={handleDeploy}
            >
              <Play className="w-4 h-4 mr-2" />
              Deploy
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette */}
        <BlockPalette onBlockSelect={handleBlockSelect} />
        
        {/* Canvas */}
        <div className="flex-1">
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
          />
        </div>
      </div>
      
      {/* AI Co-Builder */}
      <AICoBuilder
        projectId={projectId}
        userId="demo-user" // TODO: Get actual user ID
        currentNodes={nodes}
        currentEdges={edges}
        onAddNodes={handleAddNodes}
        onAddEdges={handleAddEdges}
        isOpen={isAICoBuilderOpen}
        onToggle={() => setIsAICoBuilderOpen(!isAICoBuilderOpen)}
      />
      
      {/* Workflow Simulator */}
      <WorkflowSimulator
        nodes={nodes}
        edges={edges}
        isOpen={isSimulatorOpen}
        onToggle={() => setIsSimulatorOpen(!isSimulatorOpen)}
      />
      
      {/* AI Assistant Modal (Legacy) */}
      {isAISuggestionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe what you want to build or ask for suggestions..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAISuggestionOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAIGenerate}>
                    Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};