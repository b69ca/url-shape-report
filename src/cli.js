#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { analyze } from './index.js';
const args = process.argv.slice(2), takes = new Set(['--json-path', '--max-shapes', '--max-keys']), file = args.find((x, i) => !x.startsWith('--') && !takes.has(args[i - 1])) || '-';
const one = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const readPath = (value, path) => path.split('.').filter(Boolean).reduce((v, key) => v?.[key], value);
if (args.includes('--help')) { console.log('Usage: url-shape-report [FILE|-] [--json-path request.url] [--max-shapes N] [--max-keys N] [--json] [--fail]'); process.exit(0); }
try {
  const rl = createInterface({ input: file === '-' ? process.stdin : createReadStream(file), crlfDelay: Infinity }), urls = [], jsonPath = one('--json-path', null); let lineNumber = 0;
  for await (const line of rl) { lineNumber++; if (!line.trim()) continue; if (!jsonPath) urls.push(line.trim()); else { let row; try { row = JSON.parse(line); } catch (error) { throw new Error(`line ${lineNumber}: ${error.message}`); } const value = readPath(row, jsonPath); if (typeof value !== 'string') throw new Error(`line ${lineNumber}: ${jsonPath} is not a string`); urls.push(value); } }
  const report = analyze(urls, { maxShapes: Number(one('--max-shapes', 4)), maxKeys: Number(one('--max-keys', 12)) });
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else { console.log(`${report.urlCount} URLs, ${report.endpointCount} endpoints, ${report.findingCount} findings`); for (const e of report.endpoints) console.log(`${e.endpoint}\trequests:${e.requests}\tshapes:${e.shapeCount}\tkeys:${e.keyCount}\t${e.findings.join(',') || 'ok'}`); }
  if (args.includes('--fail') && report.findingCount) process.exitCode = 1;
} catch (error) { console.error(`url-shape-report: ${error.message}`); process.exitCode = 2; }
