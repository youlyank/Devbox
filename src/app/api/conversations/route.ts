import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    
    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      );
    }
    
    const conversations = await db.conversation.findMany({
      where: { projectId, userId },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, userId, title, messages } = body;
    
    if (!projectId || !userId || !messages) {
      return NextResponse.json(
        { error: 'Project ID, User ID, and messages are required' },
        { status: 400 }
      );
    }
    
    const conversation = await db.conversation.create({
      data: {
        projectId,
        userId,
        title: title || 'New Conversation',
        messages,
      },
    });
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}