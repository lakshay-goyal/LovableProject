import { NextRequest, NextResponse } from 'next/server';
import { initializeSandbox } from '../prompt/llm/tools';

export async function GET(request: NextRequest) {
  try {
    const sandbox = await initializeSandbox();

    const getAllFiles = async (): Promise<any[]> => {
      try {
        const rootItems = await sandbox.files.list('');
        console.log('Root items:', rootItems);

        try {
          const srcItems = await sandbox.files.list('src/');
          console.log('Src directory items:', srcItems);
        } catch (error) {
          console.log('Error listing src directory:', error);
        }

        const getLanguage = (filename: string): string => {
          const ext = filename.split('.').pop()?.toLowerCase();
          const languageMap: { [key: string]: string } = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'less': 'less',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'md': 'markdown',
            'txt': 'plaintext',
            'sql': 'sql',
            'sh': 'shell',
            'bash': 'shell',
            'zsh': 'shell',
            'fish': 'shell',
            'ps1': 'powershell',
            'dockerfile': 'dockerfile',
            'gitignore': 'gitignore',
            'env': 'env',
            'ini': 'ini',
            'toml': 'toml',
            'cfg': 'ini',
            'conf': 'ini'
          };
          return languageMap[ext || ''] || 'plaintext';
        };

        const processDirectory = async (dirPath: string, items: any[]): Promise<any[]> => {
          const result = [];
          console.log(`Processing directory: ${dirPath}, items:`, items.length);

          for (const item of items) {
            const fullPath = dirPath ? `${dirPath}/${item.name}` : item.name;
            console.log(`Processing item: ${item.name}, type: ${item.type}, fullPath: ${fullPath}`);

            if (item.name === 'node_modules' || fullPath.includes('node_modules/')) {
              console.log(`Skipping node_modules: ${fullPath}`);
              continue;
            }

            let isDirectory = item.type === 'dir';
            if (!isDirectory) {
              try {
                const testChildren = await sandbox.files.list(fullPath + '/');
                isDirectory = true;
                console.log(`Item ${item.name} is actually a directory (found ${testChildren.length} children)`);
              } catch (error) {
                isDirectory = false;
              }
            }

            if (isDirectory) {
              console.log(`Getting children for directory: ${fullPath}`);
              const children = await sandbox.files.list(fullPath + '/');
              console.log(`Found ${children.length} children in ${fullPath}:`, children.map(c => c.name));
              const processedChildren = await processDirectory(fullPath, children);

              result.push({
                title: item.name,
                key: fullPath,
                isLeaf: false,
                children: processedChildren,
                path: fullPath
              });
            } else {
              result.push({
                title: item.name,
                key: fullPath,
                isLeaf: true,
                language: getLanguage(item.name),
                path: fullPath
              });
            }
          }

          console.log(`Processed directory ${dirPath}, returning ${result.length} items`);
          return result;
        };

        const fileStructure = await processDirectory('', rootItems);

        const projectFiles = fileStructure.filter(item =>
          !item.title.startsWith('.') &&
          item.title !== 'package-lock.json'
        );

        console.log('Final project files structure:', JSON.stringify(projectFiles, null, 2));
        return projectFiles;

      } catch (error) {
        console.error('Error getting all files:', error);
        return [];
      }
    };

    const fileStructure = await getAllFiles();

    return NextResponse.json({
      success: true,
      files: fileStructure
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
