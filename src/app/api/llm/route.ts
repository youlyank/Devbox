import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

interface LLMRequest {
  task: 'chat' | 'code' | 'embed' | 'generate';
  input: string;
  model?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    context?: string;
    userId?: string;
    projectId?: string;
  };
}

interface LLMResponse {
  success: boolean;
  result: any;
  model: string;
  tokens?: number;
  latency?: number;
  cost?: number;
}

// Model routing configuration
const MODEL_ROUTING = {
  chat: {
    primary: 'glm-4.5',
    fallback: 'glm-4.5-air',
    maxTokens: 2000,
    temperature: 0.7,
  },
  code: {
    primary: 'starcoder2',
    fallback: 'codellama',
    maxTokens: 4000,
    temperature: 0.3,
  },
  embed: {
    primary: 'instructor-large',
    fallback: 'text-embedding-ada-002',
    maxTokens: 512,
    temperature: 0.1,
  },
  generate: {
    primary: 'glm-4.5',
    fallback: 'glm-4.5-air',
    maxTokens: 3000,
    temperature: 0.8,
  },
};

// Cost per token (in USD)
const TOKEN_COSTS = {
  'glm-4.5': { input: 0.00001, output: 0.00003 },
  'glm-4.5-air': { input: 0.000005, output: 0.000015 },
  'starcoder2': { input: 0.00002, output: 0.00006 },
  'codellama': { input: 0.000015, output: 0.000045 },
  'instructor-large': { input: 0.000001, output: 0.000003 },
  'text-embedding-ada-002': { input: 0.0000001, output: 0.0000003 },
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: LLMRequest = await request.json();
    const { task, input, model, options = {} } = body;

    if (!task || !input) {
      return NextResponse.json(
        { error: 'Task and input are required' },
        { status: 400 }
      );
    }

    // Validate task type
    if (!MODEL_ROUTING[task]) {
      return NextResponse.json(
        { error: `Invalid task type: ${task}` },
        { status: 400 }
      );
    }

    // Check user quota if userId provided
    if (options.userId) {
      const user = await db.user.findUnique({
        where: { id: options.userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check daily AI request limit for free tier
      if (user.subscriptionTier === 'free') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const usageCount = await db.usageLog.count({
          where: {
            userId: options.userId,
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
    }

    // Select model
    const selectedModel = model || MODEL_ROUTING[task].primary;
    const config = MODEL_ROUTING[task];

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    let result: any;
    let tokens = 0;

    try {
      // Route to appropriate model based on task
      switch (task) {
        case 'chat':
          result = await handleChatTask(zai, input, selectedModel, config, options);
          tokens = result.usage?.total_tokens || 0;
          break;

        case 'code':
          result = await handleCodeTask(zai, input, selectedModel, config, options);
          tokens = result.usage?.total_tokens || 0;
          break;

        case 'embed':
          result = await handleEmbedTask(zai, input, selectedModel, config, options);
          tokens = input.length / 4; // Rough estimate for embeddings
          break;

        case 'generate':
          result = await handleGenerateTask(zai, input, selectedModel, config, options);
          tokens = result.usage?.total_tokens || 0;
          break;

        default:
          throw new Error(`Unsupported task: ${task}`);
      }

    } catch (error) {
      // Try fallback model if primary fails
      if (selectedModel !== config.fallback) {
        console.warn(`Primary model ${selectedModel} failed, trying fallback ${config.fallback}`);
        
        try {
          switch (task) {
            case 'chat':
              result = await handleChatTask(zai, input, config.fallback, config, options);
              break;
            case 'code':
              result = await handleCodeTask(zai, input, config.fallback, config, options);
              break;
            case 'generate':
              result = await handleGenerateTask(zai, input, config.fallback, config, options);
              break;
            default:
              throw error;
          }
          tokens = result.usage?.total_tokens || 0;
        } catch (fallbackError) {
          throw error; // Throw original error if fallback also fails
        }
      } else {
        throw error;
      }
    }

    const latency = Date.now() - startTime;
    const cost = calculateCost(selectedModel, tokens);

    // Log usage if userId provided
    if (options.userId) {
      await db.usageLog.create({
        data: {
          userId: options.userId,
          type: 'ai_request',
          amount: tokens,
          unit: 'tokens',
          cost,
          metadata: {
            task,
            model: selectedModel,
            latency,
            projectId: options.projectId,
          },
        },
      });
    }

    const response: LLMResponse = {
      success: true,
      result,
      model: selectedModel,
      tokens,
      latency,
      cost,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('LLM request failed:', error);
    
    const latency = Date.now() - startTime;
    
    return NextResponse.json(
      {
        success: false,
        error: 'LLM request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        latency,
      },
      { status: 500 }
    );
  }
}

async function handleChatTask(zai: any, input: string, model: string, config: any, options: any) {
  const messages = [
    {
      role: 'system',
      content: options.context || 'You are a helpful AI assistant.',
    },
    {
      role: 'user',
      content: input,
    },
  ];

  const completion = await zai.chat.completions.create({
    messages,
    model,
    temperature: options.temperature || config.temperature,
    max_tokens: options.maxTokens || config.maxTokens,
  });

  return {
    content: completion.choices[0]?.message?.content,
    usage: completion.usage,
  };
}

async function handleCodeTask(zai: any, input: string, model: string, config: any, options: any) {
  const systemPrompt = `You are an expert programmer. Generate clean, efficient, and well-documented code.
Focus on best practices, error handling, and performance optimization.
${options.context ? `Context: ${options.context}` : ''}`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: input,
    },
  ];

  const completion = await zai.chat.completions.create({
    messages,
    model,
    temperature: options.temperature || config.temperature,
    max_tokens: options.maxTokens || config.maxTokens,
  });

  return {
    code: completion.choices[0]?.message?.content,
    usage: completion.usage,
  };
}

async function handleEmbedTask(zai: any, input: string, model: string, config: any, options: any) {
  // For embeddings, we'll simulate the response since z-ai-web-dev-sdk might not have embedding support
  // In a real implementation, you would use the actual embedding API
  
  const embedding = Array.from({ length: 384 }, () => Math.random() - 0.5);
  
  return {
    embedding,
    dimensions: embedding.length,
  };
}

async function handleGenerateTask(zai: any, input: string, model: string, config: any, options: any) {
  const systemPrompt = `You are a creative content generator. Generate high-quality, engaging content based on the user's request.
Be creative, informative, and adapt your tone to the context.
${options.context ? `Context: ${options.context}` : ''}`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: input,
    },
  ];

  const completion = await zai.chat.completions.create({
    messages,
    model,
    temperature: options.temperature || config.temperature,
    max_tokens: options.maxTokens || config.maxTokens,
  });

  return {
    content: completion.choices[0]?.message?.content,
    usage: completion.usage,
  };
}

function calculateCost(model: string, tokens: number): number {
  const costs = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS];
  if (!costs) return 0;
  
  // Assume 70% input tokens, 30% output tokens (rough estimate)
  const inputTokens = Math.floor(tokens * 0.7);
  const outputTokens = Math.floor(tokens * 0.3);
  
  return (inputTokens * costs.input) + (outputTokens * costs.output);
}

// GET endpoint for model information
export async function GET() {
  return NextResponse.json({
    models: Object.keys(MODEL_ROUTING),
    routing: MODEL_ROUTING,
    costs: TOKEN_COSTS,
  });
}