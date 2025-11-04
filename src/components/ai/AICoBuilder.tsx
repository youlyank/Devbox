'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Code, 
  Layout, 
  Zap,
  History,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BuilderNode, BuilderEdge, BlockType } from '@/types/builder';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: {
    nodes: BuilderNode[];
    edges: BuilderEdge[];
    explanation: string;
  };
  status?: 'pending' | 'success' | 'error';
}

interface AICoBuilderProps {
  projectId: string;
  userId: string;
  currentNodes: BuilderNode[];
  currentEdges: BuilderEdge[];
  onAddNodes: (nodes: BuilderNode[]) => void;
  onAddEdges: (edges: BuilderEdge[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AICoBuilder: React.FC<AICoBuilderProps> = ({
  projectId,
  userId,
  currentNodes,
  currentEdges,
  onAddNodes,
  onAddEdges,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI co-builder. I can help you create applications by understanding natural language descriptions. Try saying things like:\n\n• "Add a contact form with name, email, and message fields"\n• "Create a login page with validation"\n• "Build a todo list with add/delete functionality"\n• "Make a dashboard with charts and statistics"',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate contextual suggestions based on current project
  useEffect(() => {
    const generateSuggestions = () => {
      const suggestions = [];
      
      if (currentNodes.length === 0) {
        suggestions.push('Create a landing page with hero section');
        suggestions.push('Build a contact form');
        suggestions.push('Make a login page');
      } else if (currentNodes.some(n => n.data.blockType.type === 'ui')) {
        suggestions.push('Add form validation');
        suggestions.push('Connect to a database');
        suggestions.push('Add AI chat functionality');
      } else if (currentNodes.some(n => n.data.blockType.type === 'ai')) {
        suggestions.push('Add user input fields');
        suggestions.push('Create response display');
        suggestions.push('Add conversation history');
      }
      
      setSuggestions(suggestions);
    };

    generateSuggestions();
  }, [currentNodes]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/cobuilder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          projectId,
          userId,
          currentNodes,
          currentEdges,
          context: 'You are an AI co-builder assistant. Help users build applications by suggesting and creating visual blocks.',
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation || 'I\'ve analyzed your request and created some suggestions.',
        timestamp: new Date().toISOString(),
        suggestions: data.suggestions,
        status: data.success ? 'success' : 'error',
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-apply suggestions if they exist
      if (data.suggestions?.nodes && data.suggestions.nodes.length > 0) {
        setTimeout(() => {
          onAddNodes(data.suggestions.nodes);
          if (data.suggestions.edges) {
            onAddEdges(data.suggestions.edges);
          }
        }, 1000);
      }

    } catch (error) {
      console.error('AI co-builder request failed:', error);
      
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        status: 'error',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed right-4 bottom-4 z-50 rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">AI Co-Builder</h3>
              <p className="text-xs text-gray-600">Natural language building</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">Suggestions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs h-7"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-purple-600" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                
                {message.suggestions && (
                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      {message.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm font-medium">
                        {message.suggestions.nodes.length} blocks suggested
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {message.suggestions.explanation}
                    </p>
                    {message.status === 'success' && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Blocks added to canvas
                      </p>
                    )}
                  </div>
                )}
                
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 text-purple-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to build..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            <span>{currentNodes.length} blocks</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>AI-powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};