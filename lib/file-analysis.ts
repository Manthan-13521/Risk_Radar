import crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{text: string}>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth') as { extractRawText: (input: {buffer: Buffer}) => Promise<{value: string}> };
import path from 'path';

const EXECUTABLE_EXTENSIONS = ['.exe', '.app', '.dmg', '.bat', '.cmd', '.sh', '.ps1', '.js', '.vbs', '.jar', '.msi', '.scr'];
const MACRO_EXTENSIONS = ['.docm', '.xlsm', '.pptm'];

export interface FileHeuristic {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
}

export async function extractFileMetadataAndText(fileBuffer: Buffer, filename: string, mimeType: string) {
  const size = fileBuffer.length;
  
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const sha256 = hashSum.digest('hex');
  
  // Sanitize filename to prevent path traversal in metadata logs
  const sanitizedFilename = path.basename(filename).replace(/[^a-zA-Z0-9.-_]/g, '_').substring(0, 255);
  const extension = path.extname(sanitizedFilename).toLowerCase();
  
  let text = '';
  let extracted = false;
  
  try {
    if (extension === '.txt' || extension === '.csv' || mimeType.includes('text')) {
      text = fileBuffer.toString('utf8');
      extracted = true;
    } else if (extension === '.pdf' || mimeType === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      text = data.text;
      extracted = true;
    } else if (extension === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
      extracted = true;
    }
  } catch (e: unknown) {
    console.error('Text extraction failed:', (e as Error).message);
  }

  const heuristics: FileHeuristic[] = [];
  const parts = sanitizedFilename.split('.');
  
  if (parts.length > 2) {
    const ext2 = '.' + parts[parts.length - 1].toLowerCase();
    if (EXECUTABLE_EXTENSIONS.includes(ext2)) {
      heuristics.push({
        type: 'double_extension',
        severity: 'high',
        title: 'Double extension detected',
        description: 'The filename contains two extensions, which can disguise executable files.'
      });
    }
  }
  
  if (EXECUTABLE_EXTENSIONS.includes(extension)) {
    heuristics.push({
      type: 'executable_file',
      severity: 'high',
      title: 'Executable file type',
      description: 'This file type can contain executable code and should be treated cautiously.'
    });
  }
  
  if (MACRO_EXTENSIONS.includes(extension)) {
    heuristics.push({
      type: 'macro_capable_file',
      severity: 'medium',
      title: 'Macro-capable document',
      description: 'This file type can contain executable macros.'
    });
  }
  
  return {
    metadata: {
      filename: sanitizedFilename,
      extension,
      mimeType,
      size,
      sha256,
      extractedTextLength: text.length
    },
    text: text.substring(0, 20000),
    isTruncated: text.length > 20000,
    heuristics,
    isSupportedForText: extracted
  };
}
