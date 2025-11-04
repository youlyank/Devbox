'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BLOCK_TYPES, BlockType } from '@/types/builder';
import { 
  Square, 
  Type, 
  FileText, 
  GitBranch, 
  Clock, 
  Bot, 
  Sparkles, 
  Globe, 
  Webhook,
  Search
} from 'lucide-react';

interface BlockPaletteProps {
  onBlockSelect: (blockType: BlockType) => void;
}

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

// Group blocks by category
const groupedBlocks = BLOCK_TYPES.reduce((acc, block) => {
  if (!acc[block.category]) {
    acc[block.category] = [];
  }
  acc[block.category].push(block);
  return acc;
}, {} as Record<string, BlockType[]>);

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onBlockSelect }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredBlocks = React.useMemo(() => {
    if (!searchTerm) return BLOCK_TYPES;
    
    return BLOCK_TYPES.filter(block => 
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredGroupedBlocks = React.useMemo(() => {
    if (!searchTerm) return groupedBlocks;
    
    return filteredBlocks.reduce((acc, block) => {
      if (!acc[block.category]) {
        acc[block.category] = [];
      }
      acc[block.category].push(block);
      return acc;
    }, {} as Record<string, BlockType[]>);
  }, [filteredBlocks, searchTerm]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ui': return 'bg-blue-100 text-blue-800';
      case 'logic': return 'bg-green-100 text-green-800';
      case 'ai': return 'bg-purple-100 text-purple-800';
      case 'api': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Blocks</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {Object.entries(filteredGroupedBlocks).map(([category, blocks]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{category}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {blocks.map((block) => {
                    const IconComponent = getIcon(block.icon);
                    return (
                      <Button
                        key={block.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 hover:bg-gray-50"
                        onClick={() => onBlockSelect(block)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            <IconComponent className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{block.name}</span>
                              <Badge variant="secondary" className={`text-xs ${getTypeColor(block.type)}`}>
                                {block.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {block.description}
                            </p>
                            <div className="flex gap-1 mt-2">
                              {block.inputs.length > 0 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {block.inputs.length} input{block.inputs.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              {block.outputs.length > 0 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {block.outputs.length} output{block.outputs.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};