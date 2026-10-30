#!/usr/bin/env node
// Prints a file in numbered chunks of N lines: chunk-lines.mjs <file> [size]
import { readFileSync } from "node:fs";

export function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length - size; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const [file, size = "10"] = process.argv.slice(2);
const lines = readFileSync(file, "utf8").split("\n");
chunk(lines, Number(size)).forEach((c, n) => {
  console.log(`--- chunk ${n + 1} ---\n${c.join("\n")}`);
});
