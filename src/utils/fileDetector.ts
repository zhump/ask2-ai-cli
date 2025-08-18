import fs from 'fs';
import path from 'path';

export interface FileInfo {
  exists: boolean;
  isFile: boolean;
  isDirectory: boolean;
  isEmpty?: boolean; // for directories
  size?: number; // for files
}

export function detectFileType(filePath: string): FileInfo {
  try {
    const fullPath = path.resolve(filePath);
    const stats = fs.statSync(fullPath);
    
    const info: FileInfo = {
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
    
    if (stats.isFile()) {
      info.size = stats.size;
    }
    
    if (stats.isDirectory()) {
      try {
        const contents = fs.readdirSync(fullPath);
        info.isEmpty = contents.length === 0;
      } catch {
        info.isEmpty = undefined; // Can't read directory
      }
    }
    
    return info;
  } catch {
    return {
      exists: false,
      isFile: false,
      isDirectory: false,
    };
  }
}

export function generateContextualHint(query: string): string {
  // Extract potential file/directory names from the query
  const words = query.split(/\s+/);
  const hints: string[] = [];
  
  for (const word of words) {
    // Skip common words
    if (['the', 'a', 'an', 'this', 'that', 'file', 'directory', 'folder'].includes(word.toLowerCase())) {
      continue;
    }
    
    // Check if word looks like a filename/path
    if (word.includes('.') || word.includes('/') || word.includes('\\')) {
      const fileInfo = detectFileType(word);
      
      if (fileInfo.exists) {
        if (fileInfo.isDirectory) {
          if (fileInfo.isEmpty) {
            hints.push(`${word} is an empty directory (use 'rmdir' or 'rm -rf')`);
          } else {
            hints.push(`${word} is a non-empty directory (use 'rm -rf')`);
          }
        } else if (fileInfo.isFile) {
          hints.push(`${word} is a file (use 'rm -rf')`);
        }
      } else {
        hints.push(`${word} does not exist`);
      }
    }
  }
  
  return hints.length > 0 ? `\nFile context: ${hints.join(', ')}` : '';
}