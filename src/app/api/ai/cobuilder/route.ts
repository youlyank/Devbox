import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { BLOCK_TYPES } from '@/types/builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, projectId, userId, currentNodes = [], currentEdges = [] } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const zai = await ZAI.create();
    
    // Create enhanced context for the AI co-builder
    const systemPrompt = `You are an advanced AI co-builder for a zero-code platform. You can understand natural language and convert it into visual block configurations.

AVAILABLE BLOCKS:
${BLOCK_TYPES.map(block => `- ${block.name} (${block.type}/${block.category}): ${block.description}
  Inputs: ${block.inputs.map(i => i.name).join(', ')}
  Outputs: ${block.outputs.map(o => o.name).join(', ')}`).join('\n')}

CURRENT PROJECT:
- Nodes: ${currentNodes.length}
- Edges: ${currentEdges.length}
- Existing blocks: ${currentNodes.map(n => n.data.blockType.name).join(', ') || 'None'}

Your task is to:
1. Understand the user's natural language request
2. Determine what blocks are needed
3. Create a logical arrangement of blocks
4. Generate the appropriate node and edge configurations

RESPONSE FORMAT:
{
  "explanation": "Brief explanation of what you're building",
  "suggestions": {
    "nodes": [
      {
        "id": "unique-id",
        "type": "block-type-id",
        "position": { "x": number, "y": number },
        "data": {
          "label": "Block Name",
          "blockType": { ...complete block definition... },
          "config": { ...block configuration with default values... }
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
}

IMPORTANT:
- Generate valid, complete block configurations
- Use reasonable positions (spread out nodes, avoid overlap)
- Connect blocks logically where appropriate
- Include default values for all required inputs
- Handle common patterns like forms, login pages, dashboards
- Be creative but practical

EXAMPLES:
- "contact form" → Input blocks + Button + Logic validation + Database storage
- "login page" → Input fields + Button + Logic validation + AI authentication
- "todo list" → Input + Button + Logic array management + Display list
- "dashboard" → Data fetch + Logic processing + Chart displays`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
      maxTokens: 3000,
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
      // If JSON parsing fails, create a simple response
      aiResponse = {
        explanation: responseContent,
        suggestions: {
          nodes: [],
          edges: [],
        },
      };
    }
    
    // Validate and enhance the response
    if (aiResponse.suggestions?.nodes) {
      aiResponse.suggestions.nodes = aiResponse.suggestions.nodes.map((node: any, index: number) => {
        // Ensure the node has a proper blockType
        if (!node.data.blockType) {
          const blockType = BLOCK_TYPES.find(bt => bt.id === node.type);
          if (blockType) {
            node.data.blockType = blockType;
          }
        }
        
        // Ensure proper positioning
        if (!node.position) {
          node.position = {
            x: 100 + (index % 3) * 250,
            y: 100 + Math.floor(index / 3) * 200,
          };
        }
        
        return node;
      });
    }
    
    return NextResponse.json({
      success: true,
      ...aiResponse,
    });
    
  } catch (error) {
    console.error('AI co-builder failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI co-builder request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}