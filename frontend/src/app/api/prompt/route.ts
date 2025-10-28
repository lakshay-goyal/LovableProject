import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, DynamicStructuredTool } from 'langchain';
import { z } from 'zod';
import { SYSTEM_PROMPT } from './llm/prompt';
import { createFile, updateFile, deleteFile, readFile } from './llm/tools';

// Initialize the OpenAI model
const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Define the tools for file operations using LangChain v1.0 DynamicStructuredTool
const tools = [
  new DynamicStructuredTool({
    name: 'createFile',
    description: 'Create a new file at a specified location',
    schema: z.object({
      location: z.string().describe('Relative path to the file'),
      content: z.string().describe('Content of the file'),
    }),
    func: async ({ location, content }: { location: string; content: string }) => {
      return await createFile.execute({ location, content });
    },
  }),
  new DynamicStructuredTool({
    name: 'updateFile',
    description: 'Update an existing file at a specified location',
    schema: z.object({
      location: z.string().describe('Relative path to the file'),
      content: z.string().describe('New content of the file'),
    }),
    func: async ({ location, content }: { location: string; content: string }) => {
      return await updateFile.execute({ location, content });
    },
  }),
  new DynamicStructuredTool({
    name: 'deleteFile',
    description: 'Delete a file at a specified location',
    schema: z.object({
      location: z.string().describe('Relative path to the file'),
    }),
    func: async ({ location }: { location: string }) => {
      return await deleteFile.execute({ location });
    },
  }),
  new DynamicStructuredTool({
    name: 'readFile',
    description: 'Read the contents of a file at a specified location',
    schema: z.object({
      location: z.string().describe('Relative path to the file'),
    }),
    func: async ({ location }: { location: string }) => {
      return await readFile.execute({ location });
    },
  }),
];

// Create the agent with LangChain v1.0
const agent = createAgent({
  model,
  tools,
  systemPrompt: SYSTEM_PROMPT,
});

export async function GET(request: NextRequest) {
  try {
    // const { message } = await request.json();
    const message = "Create a beautiful TODO application with add, edit, delete functionality";

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
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

    // Execute the agent with the user's message
    const result = await agent.invoke({
      messages: [
        { role: 'user', content: message }
      ],
    });

    return NextResponse.json({
      success: true,
      response: result.messages[result.messages.length - 1].content,
      usage: null, // Usage information not available in this LangChain v1.0 version
    });

  } catch (error) {
    console.error('Error in prompt API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   return NextResponse.json({
//     message: 'Prompt API is running',
//     status: 'ready',
//     availableTools: tools.map(tool => ({
//       name: tool.name,
//       description: tool.description,
//     })),
//     systemPrompt: SYSTEM_PROMPT.substring(0, 200) + '...',
//   });
// }
