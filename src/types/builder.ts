export interface BlockType {
  id: string;
  type: 'ui' | 'logic' | 'ai' | 'api';
  category: string;
  name: string;
  description: string;
  icon: string;
  inputs: BlockPort[];
  outputs: BlockPort[];
  config: Record<string, any>;
}

export interface BlockPort {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  defaultValue?: any;
}

export interface BuilderNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    blockType: BlockType;
    config: Record<string, any>;
  };
}

export interface BuilderEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  config: {
    nodes: BuilderNode[];
    edges: BuilderEdge[];
    blocks: Record<string, BlockType>;
  };
}

export const BLOCK_TYPES: BlockType[] = [
  // UI Blocks
  {
    id: 'ui-button',
    type: 'ui',
    category: 'Input',
    name: 'Button',
    description: 'Clickable button element',
    icon: 'Square',
    inputs: [
      { id: 'text', name: 'Text', type: 'string', defaultValue: 'Click me' },
      { id: 'onClick', name: 'On Click', type: 'object' }
    ],
    outputs: [
      { id: 'click', name: 'Click Event', type: 'object' }
    ],
    config: {
      variant: 'default',
      size: 'default'
    }
  },
  {
    id: 'ui-input',
    type: 'ui',
    category: 'Input',
    name: 'Text Input',
    description: 'Text input field',
    icon: 'Type',
    inputs: [
      { id: 'placeholder', name: 'Placeholder', type: 'string', defaultValue: 'Enter text...' },
      { id: 'value', name: 'Value', type: 'string' }
    ],
    outputs: [
      { id: 'onChange', name: 'Change Event', type: 'object' },
      { id: 'value', name: 'Current Value', type: 'string' }
    ],
    config: {
      type: 'text'
    }
  },
  {
    id: 'ui-text',
    type: 'ui',
    category: 'Display',
    name: 'Text',
    description: 'Display text content',
    icon: 'FileText',
    inputs: [
      { id: 'content', name: 'Content', type: 'string', defaultValue: 'Hello World' }
    ],
    outputs: [],
    config: {
      variant: 'p',
      size: 'default'
    }
  },
  
  // Logic Blocks
  {
    id: 'logic-condition',
    type: 'logic',
    category: 'Control Flow',
    name: 'Condition',
    description: 'Conditional logic branch',
    icon: 'GitBranch',
    inputs: [
      { id: 'condition', name: 'Condition', type: 'boolean', required: true },
      { id: 'input', name: 'Input', type: 'object' }
    ],
    outputs: [
      { id: 'true', name: 'True', type: 'object' },
      { id: 'false', name: 'False', type: 'object' }
    ],
    config: {}
  },
  {
    id: 'logic-delay',
    type: 'logic',
    category: 'Control Flow',
    name: 'Delay',
    description: 'Wait for specified time',
    icon: 'Clock',
    inputs: [
      { id: 'input', name: 'Input', type: 'object' },
      { id: 'duration', name: 'Duration (ms)', type: 'number', defaultValue: 1000 }
    ],
    outputs: [
      { id: 'output', name: 'Output', type: 'object' }
    ],
    config: {}
  },
  
  // AI Blocks
  {
    id: 'ai-chat',
    type: 'ai',
    category: 'Language',
    name: 'AI Chat',
    description: 'Chat with AI assistant',
    icon: 'Bot',
    inputs: [
      { id: 'message', name: 'Message', type: 'string', required: true },
      { id: 'context', name: 'Context', type: 'string' }
    ],
    outputs: [
      { id: 'response', name: 'Response', type: 'string' },
      { id: 'error', name: 'Error', type: 'string' }
    ],
    config: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  {
    id: 'ai-generate',
    type: 'ai',
    category: 'Generation',
    name: 'AI Generate',
    description: 'Generate content with AI',
    icon: 'Sparkles',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'string', required: true },
      { id: 'input', name: 'Input Data', type: 'object' }
    ],
    outputs: [
      { id: 'output', name: 'Generated Content', type: 'string' },
      { id: 'error', name: 'Error', type: 'string' }
    ],
    config: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    }
  },
  
  // API Blocks
  {
    id: 'api-request',
    type: 'api',
    category: 'HTTP',
    name: 'API Request',
    description: 'Make HTTP request',
    icon: 'Globe',
    inputs: [
      { id: 'url', name: 'URL', type: 'string', required: true },
      { id: 'method', name: 'Method', type: 'string', defaultValue: 'GET' },
      { id: 'headers', name: 'Headers', type: 'object' },
      { id: 'body', name: 'Body', type: 'object' }
    ],
    outputs: [
      { id: 'response', name: 'Response', type: 'object' },
      { id: 'error', name: 'Error', type: 'string' }
    ],
    config: {
      timeout: 5000
    }
  },
  {
    id: 'api-webhook',
    type: 'api',
    category: 'Webhooks',
    name: 'Webhook',
    description: 'Receive webhook data',
    icon: 'Webhook',
    inputs: [],
    outputs: [
      { id: 'data', name: 'Webhook Data', type: 'object' },
      { id: 'headers', name: 'Headers', type: 'object' }
    ],
    config: {
      method: 'POST'
    }
  }
];