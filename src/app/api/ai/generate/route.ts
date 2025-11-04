import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { BLOCK_TYPES } from '@/types/builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, currentNodes = [], currentEdges = [] } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    const zai = await ZAI.create();
    
    // Create a context-aware prompt for the AI assistant
    const systemPrompt = `You are an AI assistant for a zero-code builder platform. 
You help users create applications by suggesting and arranging visual blocks.

Available block types:
${BLOCK_TYPES.map(block => `- ${block.name} (${block.type}): ${block.description}`).join('\n')}

Current project has ${currentNodes.length} blocks and ${currentEdges.length} connections.

Based on the user's request, suggest a set of blocks and their connections. 
Respond with a JSON object containing:
{
  "suggestion": "Brief explanation of what you're building",
  "nodes": [
    {
      "id": "unique-id",
      "type": "block-type-id",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Block Name",
        "blockType": { ...block definition... },
        "config": { ...block configuration... }
      }
    }
  ],
  "edges": [
    {
      "id": "unique-edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "sourceHandle": "source-handle-id",
      "targetHandle": "target-handle-id"
    }
  ]
}

Keep the layout organized and logical. Use reasonable positions for nodes.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }
    
    // Try to parse the JSON response
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, return the raw text as a suggestion
      aiResponse = {
        suggestion: responseContent,
        nodes: [],
        edges: [],
      };
    }
    
    return NextResponse.json({
      success: true,
      ...aiResponse,
    });
    
  } catch (error) {
    console.error('AI generation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI suggestion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}