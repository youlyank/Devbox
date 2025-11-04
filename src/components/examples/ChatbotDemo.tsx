'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Send, User, MessageSquare, Database } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatbotDemoProps {
  projectId?: string;
  userId?: string;
}

export const ChatbotDemo: React.FC<ChatbotDemoProps> = ({
  projectId = 'demo-project',
  userId = 'demo-user',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m an AI chatbot powered by the zero-code builder. Try asking me anything!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          projectId,
          userId,
          conversationId,
          context: 'You are a helpful AI assistant for a zero-code builder platform. Help users understand how to build applications.',
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.conversation) {
        setConversationId(data.conversation.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Chatbot Example
            <Badge variant="secondary">Demo</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            This is an example of a chatbot built with the zero-code builder platform. 
            Conversations are automatically saved to the database.
          </p>
        </CardHeader>
      </Card>

      {/* Workflow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Blocks Used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">UI Input</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">AI Chat Block</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Database className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Database Storage</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Display Response</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Chat Interface</span>
            <Badge variant="outline">
              {messages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <Separator className="my-4" />
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
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
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">✅ What's Working</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time AI chat responses</li>
                <li>• Conversation history persistence</li>
                <li>• Automatic database storage</li>
                <li>• Usage tracking and limits</li>
                <li>• Responsive UI design</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🚀 Next Steps</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visual workflow builder</li>
                <li>• Custom block creation</li>
                <li>• Deployment to containers</li>
                <li>• Custom domain support</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};