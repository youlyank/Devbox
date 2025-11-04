import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, projectId, userId, conversationId, context } = body;
    
    if (!message || !projectId || !userId) {
      return NextResponse.json(
        { error: 'Message, Project ID, and User ID are required' },
        { status: 400 }
      );
    }
    
    // Get user to check subscription
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check AI request limits for free tier
    if (user.subscriptionTier === 'free') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const usageCount = await db.usageLog.count({
        where: {
          userId,
          type: 'ai_request',
          timestamp: {
            gte: today,
          },
        },
      });
      
      if (usageCount >= 10) {
        return NextResponse.json(
          { 
            error: 'AI request limit exceeded',
            message: 'Free tier users can make 10 AI requests per day. Upgrade to Pro for unlimited access.',
            limit: 10,
            used: usageCount
          },
          { status: 429 }
        );
      }
    }
    
    // Initialize ZAI SDK
    const zai = await ZAI.create();
    
    // Get conversation history if conversationId is provided
    let conversationHistory = [];
    if (conversationId) {
      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
      });
      if (conversation) {
        conversationHistory = conversation.messages;
      }
    }
    
    // Build messages array for AI
    const messages = [
      {
        role: 'system',
        content: context || 'You are a helpful AI assistant. Be concise and helpful.',
      },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      {
        role: 'user',
        content: message,
      },
    ];
    
    // Get AI response
    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });
    
    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }
    
    // Save conversation
    const newMessages = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() },
    ];
    
    let savedConversation;
    if (conversationId) {
      savedConversation = await db.conversation.update({
        where: { id: conversationId },
        data: {
          messages: newMessages,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new conversation
      savedConversation = await db.conversation.create({
        data: {
          projectId,
          userId,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          messages: newMessages,
        },
      });
    }
    
    // Log usage
    await db.usageLog.create({
      data: {
        userId,
        type: 'ai_request',
        amount: 1,
        unit: 'request',
        cost: user.subscriptionTier === 'free' ? 0 : 0.001,
      },
    });
    
    return NextResponse.json({
      response: aiResponse,
      conversation: savedConversation,
      usage: {
        type: 'ai_request',
        cost: user.subscriptionTier === 'free' ? 0 : 0.001,
      },
    });
    
  } catch (error) {
    console.error('Chat request failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}