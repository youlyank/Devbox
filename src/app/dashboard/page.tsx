'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Server, 
  Play, 
  Square, 
  RotateCcw,
  Activity,
  Cpu,
  HardDrive,
  Globe,
  Settings,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  status: 'pending' | 'building' | 'running' | 'stopped' | 'error';
  url?: string;
  subdomain?: string;
  containerId?: string;
  createdAt: string;
  startedAt?: string;
  stoppedAt?: string;
  metrics?: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
  logs?: string;
}

export default function Dashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'deployments' | 'analytics' | 'settings'>('deployments');

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDeployments = async () => {
    try {
      // In a real app, this would fetch from the API
      // For now, using mock data
      const mockDeployments: Deployment[] = [
        {
          id: '1',
          name: 'Chatbot Demo',
          status: 'running',
          url: 'https://chatbot-demo.builder.app',
          subdomain: 'chatbot-demo',
          containerId: 'container_123',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metrics: {
            cpu: 15.2,
            memory: 45.8,
            storage: 128,
            bandwidth: 1024,
          },
        },
        {
          id: '2',
          name: 'Contact Form',
          status: 'stopped',
          url: 'https://contact-form.builder.app',
          subdomain: 'contact-form',
          containerId: 'container_456',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          startedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
          stoppedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metrics: {
            cpu: 0,
            memory: 0,
            storage: 64,
            bandwidth: 512,
          },
        },
        {
          id: '3',
          name: 'E-commerce Store',
          status: 'building',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          metrics: {
            cpu: 0,
            memory: 0,
            storage: 0,
            bandwidth: 0,
          },
        },
      ];
      
      setDeployments(mockDeployments);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      setIsLoading(false);
    }
  };

  const handleStartDeployment = async (deploymentId: string) => {
    try {
      // API call to start deployment
      console.log('Starting deployment:', deploymentId);
      // Update local state optimistically
      setDeployments(prev => 
        prev.map(d => 
          d.id === deploymentId 
            ? { ...d, status: 'running', startedAt: new Date().toISOString() }
            : d
        )
      );
    } catch (error) {
      console.error('Failed to start deployment:', error);
    }
  };

  const handleStopDeployment = async (deploymentId: string) => {
    try {
      // API call to stop deployment
      console.log('Stopping deployment:', deploymentId);
      // Update local state optimistically
      setDeployments(prev => 
        prev.map(d => 
          d.id === deploymentId 
            ? { ...d, status: 'stopped', stoppedAt: new Date().toISOString() }
            : d
        )
      );
    } catch (error) {
      console.error('Failed to stop deployment:', error);
    }
  };

  const handleRestartDeployment = async (deploymentId: string) => {
    try {
      // API call to restart deployment
      console.log('Restarting deployment:', deploymentId);
      // Update local state optimistically
      setDeployments(prev => 
        prev.map(d => 
          d.id === deploymentId 
            ? { ...d, status: 'running', startedAt: new Date().toISOString(), stoppedAt: undefined }
            : d
        )
      );
    } catch (error) {
      console.error('Failed to restart deployment:', error);
    }
  };

  const handleDeleteDeployment = async (deploymentId: string) => {
    try {
      // API call to delete deployment
      console.log('Deleting deployment:', deploymentId);
      setDeployments(prev => prev.filter(d => d.id !== deploymentId));
      setSelectedDeployment(null);
    } catch (error) {
      console.error('Failed to delete deployment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'building': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-3 h-3" />;
      case 'stopped': return <Square className="w-3 h-3" />;
      case 'building': return <RotateCcw className="w-3 h-3 animate-spin" />;
      case 'error': return <Square className="w-3 h-3" />;
      default: return <Server className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Server className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold">Hosting Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => window.location.href = '/'}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'deployments', label: 'Deployments', icon: Server },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'deployments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deployments List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Deployed Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p>Loading deployments...</p>
                    </div>
                  ) : deployments.length === 0 ? (
                    <div className="text-center py-8">
                      <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No deployments yet</p>
                      <Button className="mt-4" onClick={() => window.location.href = '/'}>
                        Create Your First Project
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deployments.map((deployment) => (
                        <div
                          key={deployment.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedDeployment?.id === deployment.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedDeployment(deployment)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(deployment.status)}
                                <span className="font-medium">{deployment.name}</span>
                              </div>
                              <Badge className={getStatusColor(deployment.status)}>
                                {deployment.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {deployment.url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(deployment.url, '_blank');
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              )}
                              {deployment.status === 'running' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStopDeployment(deployment.id);
                                  }}
                                >
                                  <Square className="w-4 h-4 mr-1" />
                                  Stop
                                </Button>
                              ) : deployment.status === 'stopped' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartDeployment(deployment.id);
                                  }}
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Start
                                </Button>
                              ) : null}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestartDeployment(deployment.id);
                                }}
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Restart
                              </Button>
                            </div>
                          </div>
                          {deployment.subdomain && (
                            <div className="text-sm text-gray-600 mt-2">
                              {deployment.subdomain}.builder.app
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Created {new Date(deployment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Deployment Details */}
            <div className="lg:col-span-1">
              {selectedDeployment ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedDeployment.name}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDeployment(selectedDeployment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status */}
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <Badge className={getStatusColor(selectedDeployment.status)}>
                        {getStatusIcon(selectedDeployment.status)}
                        <span className="ml-1">{selectedDeployment.status}</span>
                      </Badge>
                    </div>

                    {/* URLs */}
                    {selectedDeployment.url && (
                      <div>
                        <h4 className="font-medium mb-2">URL</h4>
                        <a
                          href={selectedDeployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {selectedDeployment.url}
                        </a>
                      </div>
                    )}

                    {/* Metrics */}
                    {selectedDeployment.metrics && (
                      <div>
                        <h4 className="font-medium mb-2">Resource Usage</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4" />
                              <span>CPU</span>
                            </div>
                            <span>{selectedDeployment.metrics.cpu}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              <span>Memory</span>
                            </div>
                            <span>{selectedDeployment.metrics.memory}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4" />
                              <span>Storage</span>
                            </div>
                            <span>{selectedDeployment.metrics.storage} MB</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>Bandwidth</span>
                            </div>
                            <span>{selectedDeployment.metrics.bandwidth} MB</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Container Info */}
                    {selectedDeployment.containerId && (
                      <div>
                        <h4 className="font-medium mb-2">Container</h4>
                        <p className="text-sm text-gray-600 font-mono">
                          {selectedDeployment.containerId}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div>
                      <h4 className="font-medium mb-2">Timeline</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Created: {new Date(selectedDeployment.createdAt).toLocaleString()}</div>
                        {selectedDeployment.startedAt && (
                          <div>Started: {new Date(selectedDeployment.startedAt).toLocaleString()}</div>
                        )}
                        {selectedDeployment.stoppedAt && (
                          <div>Stopped: {new Date(selectedDeployment.stoppedAt).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Select a deployment to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Deployments</span>
                    <span className="font-semibold">{deployments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Running Applications</span>
                    <span className="font-semibold">
                      {deployments.filter(d => d.status === 'running').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total CPU Usage</span>
                    <span className="font-semibold">
                      {deployments.reduce((sum, d) => sum + (d.metrics?.cpu || 0), 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Memory Usage</span>
                    <span className="font-semibold">
                      {deployments.reduce((sum, d) => sum + (d.metrics?.memory || 0), 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = '/'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Billing
                </Button>
                <Button variant="outline" className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Subscription Plan</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Current Plan</span>
                      <Badge>Pro</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      $15/month • Up to 5 deployments • Priority support
                    </p>
                    <Button className="mt-3" variant="outline">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Usage Limits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Deployments</span>
                      <span>2 / 5 used</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>AI Requests</span>
                      <span>45 / 1,000 used</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage</span>
                      <span>192 MB / 1 GB used</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Danger Zone</h4>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}