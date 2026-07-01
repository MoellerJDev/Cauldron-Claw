import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const coreRoot = fileURLToPath(new URL('.', import.meta.url));

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return collectSourceFiles(path);
    }

    if (path.endsWith('.ts') && !path.endsWith('.test.ts')) {
      return [path];
    }

    return [];
  });
}

describe('core module boundaries', () => {
  it('keeps rendering, physics, and browser implementation details out of core source', () => {
    const files = collectSourceFiles(coreRoot);
    const forbiddenPatterns = [
      /from ['"]pixi\.js['"]/,
      /from ['"]matter-js['"]/,
      /\bwindow\b/,
      /\bdocument\b/,
      /\bHTMLElement\b/,
      /\bHTMLCanvasElement\b/,
    ];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');

      for (const pattern of forbiddenPatterns) {
        expect(source, `${file} should not match ${pattern}`).not.toMatch(
          pattern,
        );
      }
    }
  });
});
