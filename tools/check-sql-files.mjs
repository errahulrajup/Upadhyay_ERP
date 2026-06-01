import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = [
  join(process.cwd(), 'database', 'migrations'),
  join(process.cwd(), 'database', 'seeds'),
  join(process.cwd(), 'database', 'checks'),
];

let checked = 0;

for (const root of roots) {
  for (const file of readdirSync(root).filter(name => name.endsWith('.sql')).sort()) {
    const fullPath = join(root, file);
    if (statSync(fullPath).size === 0) {
      throw new Error(`Empty SQL file: ${fullPath}`);
    }

    const content = readFileSync(fullPath, 'utf8');
    if (content.includes('Date.now') || content.includes('localStorage')) {
      throw new Error(`Forbidden legacy pattern in SQL file: ${fullPath}`);
    }

    checked += 1;
  }
}

console.log(`SQL file check passed: ${checked} file(s).`);

