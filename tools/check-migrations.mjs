import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const migrationsDir = join(process.cwd(), 'database', 'migrations');
const files = readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  throw new Error('No migration files found.');
}

const seen = new Set();
for (const file of files) {
  if (!/^\d{4}_[a-z0-9_]+\.sql$/.test(file)) {
    throw new Error(`Invalid migration name: ${file}`);
  }
  const prefix = file.slice(0, 4);
  if (seen.has(prefix)) {
    throw new Error(`Duplicate migration prefix: ${prefix}`);
  }
  seen.add(prefix);

  const fullPath = join(migrationsDir, file);
  if (statSync(fullPath).size === 0) {
    throw new Error(`Empty migration file: ${file}`);
  }
}

console.log(`Migration check passed: ${files.length} file(s).`);

