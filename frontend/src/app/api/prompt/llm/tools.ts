import { Sandbox } from '@e2b/code-interpreter';
import { z } from 'zod';

let sandbox: Sandbox | null = null;

let lastActivityTime = Date.now();

function recordActivity(action: string) {
  lastActivityTime = Date.now();
  console.log(`Activity recorded: ${action} at ${new Date().toISOString()}`);
}

export async function initializeSandbox(): Promise<Sandbox> {
  if (!sandbox) {
    const TEMPLATE_ID = "m9jx9or7gpa5tdf7q7hy";
    sandbox = await Sandbox.create(TEMPLATE_ID);
    recordActivity('sandbox_initialized');
  }
  return sandbox;
}

export async function getSandboxHost(): Promise<string> {
  const sandboxInstance = await initializeSandbox();
  return sandboxInstance.getHost(5173);
}

export const createFile = {
  name: 'createFile',
  description: 'Create a new file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
    content: z.string().describe('Content of the file'),
  }),
  execute: async ({ location, content }: { location: string; content: string }) => {
    try {
      recordActivity('create_file');
      const sandboxInstance = await initializeSandbox();
      
      if (!location.startsWith('src/')) {
        return `Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      const pathParts = location.split('/');
      if (pathParts.length > 2) {
        const dirPath = pathParts.slice(0, -1).join('/');
        try {
          await sandboxInstance.files.makeDir(dirPath);
          console.log(`Directory created: ${dirPath}`);
        } catch (dirError) {
          console.log(`Directory may already exist: ${dirPath}`);
        }
      }
      
      await sandboxInstance.files.write(location, content);
      
      console.log(`File created at ${location}`);
      return `File created successfully at ${location}\nContent length: ${content.length} characters`;
    } catch (error) {
      console.error(`Error creating file at ${location}:`, error);
      return `Error creating file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

export const updateFile = {
  name: 'updateFile',
  description: 'Update an existing file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
    content: z.string().describe('New content of the file'),
  }),
  execute: async ({ location, content }: { location: string; content: string }) => {
    try {
      recordActivity('update_file');
      const sandboxInstance = await initializeSandbox();
      
      if (!location.startsWith('src/')) {
        return `Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      const exists = await sandboxInstance.files.exists(location);
      if (!exists) {
        return `File ${location} does not exist. Use createFile to create it first.`;
      }
      
      await sandboxInstance.files.write(location, content);
      
      console.log(`File updated at ${location}`);
      return `File updated successfully at ${location}\nContent length: ${content.length} characters`;
    } catch (error) {
      console.error(`Error updating file at ${location}:`, error);
      return `Error updating file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

export const deleteFile = {
  name: 'deleteFile',
  description: 'Delete a file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
  }),
  execute: async ({ location }: { location: string }) => {
    try {
      recordActivity('delete_file');
      const sandboxInstance = await initializeSandbox();
      
      if (!location.startsWith('src/')) {
          return `Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      const exists = await sandboxInstance.files.exists(location);
      if (!exists) {
        return `File ${location} does not exist.`;
      }
      
      await sandboxInstance.files.remove(location);
      
      console.log(`File deleted at ${location}`);
      return `File deleted successfully at ${location}`;
    } catch (error) {
      console.error(`Error deleting file at ${location}:`, error);
      return `Error deleting file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

export const readFile = {
  name: 'readFile',
  description: 'Read the contents of a file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
  }),
  execute: async ({ location }: { location: string }) => {
    try {
      recordActivity('read_file');
      const sandboxInstance = await initializeSandbox();
      
      if (!location.startsWith('src/')) {
        return `Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      const exists = await sandboxInstance.files.exists(location);
      if (!exists) {
        return `File ${location} does not exist.`;
      }
      
      const content = await sandboxInstance.files.read(location);
      
      console.log(`File read at ${location}`);
      return `File contents of ${location}:\n\n${content}\n\nContent length: ${content.length} characters`;
    } catch (error) {
      console.error(`Error reading file at ${location}:`, error);
      return `Error reading file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

export const listDirectory = {
  name: 'listDirectory',
  description: 'List files and directories in a specified path in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the directory (e.g., src/ or src/components/)'),
  }),
  execute: async ({ location }: { location: string }) => {
    try {
      recordActivity('list_directory');
      const sandboxInstance = await initializeSandbox();
      
      const normalizedPath = location.endsWith('/') ? location : `${location}/`;
      
      const exists = await sandboxInstance.files.exists(normalizedPath);
      if (!exists) {
        return `Directory ${normalizedPath} does not exist.`;
      }
      
      const contents = await sandboxInstance.files.list(normalizedPath);
      
      console.log(`Directory listed at ${normalizedPath}`);
      
      if (contents.length === 0) {
        return `Directory ${normalizedPath} is empty`;
      }
      
      const formattedContents = contents.map((item: any) => {
        const icon = item.isDir ? 'DIR' : 'FILE';
        const type = item.isDir ? 'DIR' : 'FILE';
        return `${icon} ${item.name} (${type})`;
      }).join('\n');
      
          return `Directory contents of ${normalizedPath}:\n\n${formattedContents}\n\nTotal: ${contents.length} items`;
    } catch (error) {
      console.error(`Error listing directory at ${location}:`, error);
      return `Error listing directory at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

export async function cleanupSandbox(): Promise<void> {
  if (sandbox) {
    try {
      recordActivity('sandbox_cleanup');
      await sandbox.kill();
      sandbox = null;
      console.log('Sandbox cleaned up');
    } catch (error) {
      console.error('Error cleaning up sandbox:', error);
    }
  }
}

export function getLastActivityTime(): number {
  return lastActivityTime;
}
