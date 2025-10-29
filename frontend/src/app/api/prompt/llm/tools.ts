import { Sandbox } from '@e2b/code-interpreter';
import { z } from 'zod';

// Global sandbox instance
let sandbox: Sandbox | null = null;

// Initialize sandbox
export async function initializeSandbox(): Promise<Sandbox> {
  if (!sandbox) {
    const TEMPLATE_ID = "m9jx9or7gpa5tdf7q7hy";
    sandbox = await Sandbox.create(TEMPLATE_ID);
  }
  return sandbox;
}

// Get sandbox host URL
export async function getSandboxHost(): Promise<string> {
  const sandboxInstance = await initializeSandbox();
  return sandboxInstance.getHost(5173);
}

// Create file tool
export const createFile = {
  name: 'createFile',
  description: 'Create a new file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
    content: z.string().describe('Content of the file'),
  }),
  execute: async ({ location, content }: { location: string; content: string }) => {
    try {
      const sandboxInstance = await initializeSandbox();
      
      // Validate file path
      if (!location.startsWith('src/')) {
        return `❌ Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      // Ensure the directory exists
      const pathParts = location.split('/');
      if (pathParts.length > 2) { // More than just 'src/filename'
        const dirPath = pathParts.slice(0, -1).join('/');
        try {
          await sandboxInstance.files.makeDir(dirPath);
          console.log(`📁 Directory created: ${dirPath}`);
        } catch (dirError) {
          console.log(`📁 Directory may already exist: ${dirPath}`);
        }
      }
      
      // Create the file
      await sandboxInstance.files.write(location, content);
      
      console.log(`✅ File created at ${location}`);
      return `✅ File created successfully at ${location}\n📄 Content length: ${content.length} characters`;
    } catch (error) {
      console.error(`❌ Error creating file at ${location}:`, error);
      return `❌ Error creating file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

// Update file tool
export const updateFile = {
  name: 'updateFile',
  description: 'Update an existing file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
    content: z.string().describe('New content of the file'),
  }),
  execute: async ({ location, content }: { location: string; content: string }) => {
    try {
      const sandboxInstance = await initializeSandbox();
      
      // Validate file path
      if (!location.startsWith('src/')) {
        return `❌ Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      // Check if file exists
      const exists = await sandboxInstance.files.exists(location);
      if (!exists) {
        return `❌ File ${location} does not exist. Use createFile to create it first.`;
      }
      
      // Update the file
      await sandboxInstance.files.write(location, content);
      
      console.log(`✅ File updated at ${location}`);
      return `✅ File updated successfully at ${location}\n📄 Content length: ${content.length} characters`;
    } catch (error) {
      console.error(`❌ Error updating file at ${location}:`, error);
      return `❌ Error updating file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

// Delete file tool
export const deleteFile = {
  name: 'deleteFile',
  description: 'Delete a file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
  }),
  execute: async ({ location }: { location: string }) => {
    try {
      const sandboxInstance = await initializeSandbox();
      
      // Validate file path
      if (!location.startsWith('src/')) {
        return `❌ Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      // Check if file exists
      const exists = await sandboxInstance.files.exists(location);
      if (!exists) {
        return `❌ File ${location} does not exist.`;
      }
      
      // Delete the file
      await sandboxInstance.files.remove(location);
      
      console.log(`✅ File deleted at ${location}`);
      return `✅ File deleted successfully at ${location}`;
    } catch (error) {
      console.error(`❌ Error deleting file at ${location}:`, error);
      return `❌ Error deleting file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

// Read file tool
export const readFile = {
  name: 'readFile',
  description: 'Read the contents of a file at a specified location in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the file (e.g., src/components/TodoItem.tsx)'),
  }),
  execute: async ({ location }: { location: string }) => {
    try {
      const sandboxInstance = await initializeSandbox();
      
      // Validate file path
      if (!location.startsWith('src/')) {
        return `❌ Error: File path must start with 'src/' but got '${location}'. Use relative paths like 'src/components/ComponentName.tsx'`;
      }
      
      // Check if file exists
      const exists = await sandboxInstance.files.exists(location);
      if (!exists) {
        return `❌ File ${location} does not exist.`;
      }
      
      // Read the file
      const content = await sandboxInstance.files.read(location);
      
      console.log(`✅ File read at ${location}`);
      return `📄 File contents of ${location}:\n\n${content}\n\n📊 Content length: ${content.length} characters`;
    } catch (error) {
      console.error(`❌ Error reading file at ${location}:`, error);
      return `❌ Error reading file at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

// List directory tool
export const listDirectory = {
  name: 'listDirectory',
  description: 'List files and directories in a specified path in the E2B sandbox',
  parameters: z.object({
    location: z.string().describe('Relative path to the directory (e.g., src/ or src/components/)'),
  }),
  execute: async ({ location }: { location: string }) => {
    try {
      const sandboxInstance = await initializeSandbox();
      
      // Normalize path
      const normalizedPath = location.endsWith('/') ? location : `${location}/`;
      
      // Check if directory exists
      const exists = await sandboxInstance.files.exists(normalizedPath);
      if (!exists) {
        return `❌ Directory ${normalizedPath} does not exist.`;
      }
      
      // List directory contents
      const contents = await sandboxInstance.files.list(normalizedPath);
      
      console.log(`✅ Directory listed at ${normalizedPath}`);
      
      if (contents.length === 0) {
        return `📁 Directory ${normalizedPath} is empty`;
      }
      
      const formattedContents = contents.map((item: any) => {
        const icon = item.isDir ? '📁' : '📄';
        const type = item.isDir ? 'DIR' : 'FILE';
        return `${icon} ${item.name} (${type})`;
      }).join('\n');
      
      return `📁 Directory contents of ${normalizedPath}:\n\n${formattedContents}\n\nTotal: ${contents.length} items`;
    } catch (error) {
      console.error(`❌ Error listing directory at ${location}:`, error);
      return `❌ Error listing directory at ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

// Cleanup function
export async function cleanupSandbox(): Promise<void> {
  if (sandbox) {
    try {
      await sandbox.kill();
      sandbox = null;
      console.log('✅ Sandbox cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up sandbox:', error);
    }
  }
}
