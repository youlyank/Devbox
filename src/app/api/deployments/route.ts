import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, config } = body;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Get project details
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check user's subscription tier
    const userTier = project.user.subscriptionTier;
    if (userTier === 'free') {
      return NextResponse.json(
        { 
          error: 'Deployment requires a paid subscription',
          tier: userTier,
          message: 'Please upgrade to a Pro or Business plan to deploy your project.'
        },
        { status: 403 }
      );
    }
    
    // Create deployment record
    const deployment = await db.deployment.create({
      data: {
        projectId,
        version: `v${Date.now()}`,
        status: 'pending',
        config: config || project.config,
        url: `https://${project.id}.${uuidv4()}.builder.app`,
      },
    });
    
    // TODO: Implement actual deployment logic
    // This would involve:
    // 1. Creating a Docker container
    // 2. Setting up Nginx reverse proxy
    // 3. Configuring SSL
    // 4. Starting the container
    
    // Simulate deployment process
    setTimeout(async () => {
      try {
        await db.deployment.update({
          where: { id: deployment.id },
          data: {
            status: 'running',
            containerId: `container_${deployment.id}`,
          },
        });
        
        // Log usage
        await db.usageLog.create({
          data: {
            userId: project.userId,
            deploymentId: deployment.id,
            type: 'deployment',
            amount: 1,
            unit: 'deployment',
            cost: userTier === 'pro' ? 0.01 : 0.05,
          },
        });
      } catch (error) {
        console.error('Failed to update deployment status:', error);
      }
    }, 5000);
    
    return NextResponse.json({
      deployment,
      message: 'Deployment started successfully',
      estimatedTime: '30 seconds',
    });
    
  } catch (error) {
    console.error('Deployment failed:', error);
    return NextResponse.json(
      { error: 'Failed to create deployment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    
    let deployments;
    
    if (projectId) {
      deployments = await db.deployment.findMany({
        where: { projectId },
        include: {
          project: {
            select: {
              name: true,
              userId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userId) {
      deployments = await db.deployment.findMany({
        where: {
          project: { userId },
        },
        include: {
          project: {
            select: {
              name: true,
              userId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json(
        { error: 'Project ID or User ID is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ deployments });
  } catch (error) {
    console.error('Failed to fetch deployments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}