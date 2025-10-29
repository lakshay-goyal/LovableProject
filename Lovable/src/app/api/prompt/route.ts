import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, DynamicStructuredTool } from 'langchain';
import { z } from 'zod';
import { SYSTEM_PROMPT } from './llm/prompt';
import { 
  initializeSandbox, 
  getSandboxHost, 
  createFile, 
  updateFile, 
  deleteFile, 
  readFile, 
  listDirectory,
  cleanupSandbox 
} from './llm/tools';

const model = new ChatOpenAI({
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});


const tools = [
  new DynamicStructuredTool({
    name: 'createFile',
    description: 'Create a new file at a specified location in the E2B sandbox',
    schema: z.object({
      location: z.string().describe('Relative path to the file (e.g., src/App.tsx)'),
      content: z.string().describe('Content of the file'),
    }),
    func: createFile.execute,
  }),
  new DynamicStructuredTool({
    name: 'updateFile',
    description: 'Update an existing file at a specified location in the E2B sandbox',
    schema: z.object({
      location: z.string().describe('Relative path to the file (e.g., src/App.tsx)'),
      content: z.string().describe('New content of the file'),
    }),
    func: updateFile.execute,
  }),
  new DynamicStructuredTool({
    name: 'deleteFile',
    description: 'Delete a file at a specified location in the E2B sandbox',
    schema: z.object({
      location: z.string().describe('Relative path to the file (e.g., src/App.tsx)'),
    }),
    func: deleteFile.execute,
  }),
  new DynamicStructuredTool({
    name: 'readFile',
    description: 'Read the contents of a file at a specified location in the E2B sandbox',
    schema: z.object({
      location: z.string().describe('Relative path to the file (e.g., src/App.tsx)'),
    }),
    func: readFile.execute,
  }),
  new DynamicStructuredTool({
    name: 'listDirectory',
    description: 'List files and directories in a specified path in the E2B sandbox',
    schema: z.object({
      location: z.string().describe('Relative path to the directory (e.g., src/)'),
    }),
    func: listDirectory.execute,
  }),
];

const agent = createAgent({
  model,
  tools,
  systemPrompt: SYSTEM_PROMPT,
});

export async function GET(request: NextRequest) {
  try {
    const message = "Create a beautiful TODO application with add, edit, delete functionality";

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key is not configured',
          message: 'Please set OPENAI_API_KEY environment variable to use LangChain integration',
          mockResponse: `I would create a beautiful TODO application with the following features:
          
1. **Main Todo Component** - A clean, modern interface with Tailwind CSS
2. **Add Todo** - Input field with add button
3. **Todo List** - Display all todos with checkboxes
4. **Edit Todo** - Click to edit functionality
5. **Delete Todo** - Remove button for each todo
6. **Responsive Design** - Works on all screen sizes

The application would use React hooks for state management and Tailwind CSS for styling.`,
          systemPrompt: SYSTEM_PROMPT.substring(0, 200) + '...'
        },
        { status: 500 }
      );
    }

    console.log('Initializing E2B sandbox...');
    const sandbox = await initializeSandbox();
    const sandboxUrl = await getSandboxHost();
    console.log(`Sandbox initialized at: https://${sandboxUrl}`);

    console.log('Executing agent with message:', message);
    const result = await agent.invoke({
      messages: [
        { role: 'user', content: message }
      ],
    });

    console.log('Agent execution completed');

    return NextResponse.json({
      success: true,
      response: result.messages[result.messages.length - 1].content,
      sandboxUrl: `https://${sandboxUrl}`,
      usage: null,
    });

  } catch (error) {
    console.error('Error in prompt API:', error);
    
    try {
      await cleanupSandbox();
    } catch (cleanupError) {
      console.error('Error cleaning up sandbox:', cleanupError);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key is not configured',
          message: 'Please set OPENAI_API_KEY environment variable to use LangChain integration',
        },
        { status: 500 }
      );
    }

    console.log('Initializing E2B sandbox...');
    const sandbox = await initializeSandbox();
    const sandboxUrl = await getSandboxHost();
    console.log(`Sandbox initialized at: https://${sandboxUrl}`);

    console.log('Executing agent with message:', message);
    const result = await agent.invoke({
      messages: [
        { role: 'user', content: message }
      ],
    });

    console.log('Agent execution completed');

    return NextResponse.json({
      success: true,
      response: result.messages[result.messages.length - 1].content,
      sandboxUrl: `https://${sandboxUrl}`,
      usage: null,
    });

  } catch (error) {
    console.error('Error in prompt API:', error);
    
    try {
      await cleanupSandbox();
    } catch (cleanupError) {
      console.error('Error cleaning up sandbox:', cleanupError);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await cleanupSandbox();
    return NextResponse.json({
      success: true,
      message: 'Sandbox cleaned up successfully'
    });
  } catch (error) {
    console.error('Error cleaning up sandbox:', error);
    return NextResponse.json(
      { 
        error: 'Error cleaning up sandbox',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}