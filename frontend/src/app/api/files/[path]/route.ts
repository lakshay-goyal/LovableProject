import { NextRequest, NextResponse } from 'next/server';
import { initializeSandbox } from '../../prompt/llm/tools';

// GET /api/files/[path] - Get file content from E2B sandbox
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params;
    const decodedPath = decodeURIComponent(path);
    
    // Use the path as-is since we're now handling full paths
    const fullPath = decodedPath;
    
    const sandbox = await initializeSandbox();
    
    // Check if file exists
    const exists = await sandbox.files.exists(fullPath);
    if (!exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'File not found',
          details: `File ${fullPath} does not exist`
        },
        { status: 404 }
      );
    }
    
    // Check if it's a directory by trying to list it
    try {
      const dirContents = await sandbox.files.list(fullPath + '/');
      // If we can list it, it's a directory
      return NextResponse.json(
        { 
          success: false,
          error: 'Path is a directory',
          details: `${fullPath} is a directory, not a file`
        },
        { status: 400 }
      );
    } catch (dirError) {
      // If listing fails, it's likely a file, continue with reading
    }
    
    // Read file content
    const content = await sandbox.files.read(fullPath);
    
    // Determine language based on file extension
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

    const language = getLanguage(fullPath);
    
    return NextResponse.json({
      success: true,
      content,
      language,
      path: fullPath
    });

  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to read file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
