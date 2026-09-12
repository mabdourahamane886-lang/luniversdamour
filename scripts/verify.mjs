import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const roots = ["api", "src", "js"];
const extensions = new Set([".js", ".mjs"]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (extensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

const files = [];
for (const root of roots) {
  try {
    files.push(...(await walk(root)));
  } catch (error) {
    console.error(`Build verification failed: missing ${root}`, error.message);
    process.exit(1);
  }
}

for (const file of files.sort()) {
  try {
    await execFileAsync(process.execPath, ["--check", file]);
  } catch (error) {
    console.error(`Syntax error: ${file}`);
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

await fs.access("index.html");
await fs.access("vercel.json");
console.log(`Production verification passed: ${files.length} JavaScript files checked.`);
