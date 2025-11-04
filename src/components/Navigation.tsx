'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Builder } from '@/components/builder/Builder';
import { ChatbotDemo } from '@/components/examples/ChatbotDemo';
import { Blocks, Bot, Play, Settings, Server, CreditCard } from 'lucide-react';

// Placeholder components
const DashboardComponent = () => {
  React.useEffect(() => {
    window.location.href = '/dashboard';
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Server className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <p className="text-lg">Loading Dashboard...</p>
      </div>
    </div>
  );
};

const BillingComponent = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Billing & Subscription</h2>
          <p className="text-gray-600 mb-4">
            Manage your subscription and payment methods.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold">Free</h3>
                <p className="text-2xl font-bold">$0<span className="text-sm text-gray-600">/month</span></p>
                <p className="text-sm text-gray-600 mt-2">Build unlimited projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 border-2 border-blue-500">
                <h3 className="font-semibold">Pro</h3>
                <p className="text-2xl font-bold">$15<span className="text-sm text-gray-600">/month</span></p>
                <p className="text-sm text-gray-600 mt-2">Deploy up to 5 projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold">Business</h3>
                <p className="text-2xl font-bold">$49<span className="text-sm text-gray-600">/month</span></p>
                <p className="text-sm text-gray-600 mt-2">Dedicated containers</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

type View = 'builder' | 'demo' | 'projects' | 'dashboard' | 'billing';

export const Navigation: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('builder');
  const [demoUser, setDemoUser] = useState<any>(null);

  const handleSave = (project: any) => {
    console.log('Saving project:', project);
    // TODO: Implement actual save
  };

  const handleDeploy = (project: any) => {
    console.log('Deploying project:', project);
    // TODO: Implement actual deploy
  };

  const createDemoUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          name: 'Demo User',
        }),
      });
      
      const data = await response.json();
      setDemoUser(data.user);
    } catch (error) {
      console.error('Failed to create demo user:', error);
    }
  };

  React.useEffect(() => {
    createDemoUser();
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'builder':
        return (
          <Builder
            onSave={handleSave}
            onDeploy={handleDeploy}
          />
        );
      case 'demo':
        return (
          <ChatbotDemo
            userId={demoUser?.id || 'demo-user'}
            projectId="demo-chatbot"
          />
        );
      case 'projects':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Projects</h2>
                <p className="text-gray-600">
                  Project management interface coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'dashboard':
        return <DashboardComponent />;
      case 'billing':
        return <BillingComponent />;
      default:
        return null;
    }
  };

  if (currentView === 'builder') {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Zero-Code Builder
              </h1>
              <nav className="flex space-x-2">
                <Button
                  variant={currentView === 'builder' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('builder')}
                >
                  <Blocks className="w-4 h-4 mr-2" />
                  Builder
                </Button>
                <Button
                  variant={currentView === 'demo' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('demo')}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Demo
                </Button>
                <Button
                  variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('dashboard')}
                >
                  <Server className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={currentView === 'billing' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('billing')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
                <Button
                  variant={currentView === 'projects' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('projects')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Projects
                </Button>
              </nav>
            </div>
            
            {demoUser && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {demoUser.name} ({demoUser.subscriptionTier})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/builder'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Open Builder
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};