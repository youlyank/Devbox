import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const projects = await db.project.findMany({
      where: { userId },
      include: {
        workflows: true,
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, userId, config } = body;
    
    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and user ID are required' },
        { status: 400 }
      );
    }
    
    const project = await db.project.create({
      data: {
        name,
        description,
        userId,
        config: config || { nodes: [], edges: [], blocks: {} },
      },
    });
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}