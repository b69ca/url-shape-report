import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, endpointOf, shapeOf } from '../src/index.js';
test('normalizes identifiers in paths', () => { assert.equal(endpointOf('https://api.test/users/123/orders/550e8400-e29b-41d4-a716-446655440000'), 'https://api.test/users/:number/orders/:uuid'); });
test('shape ignores values and key order', () => { assert.equal(shapeOf('https://x.test/?b=secret&a=1&a=2'), 'a&b'); });
test('detects fragmented query shapes', () => { const r = analyze(['/x?a=1', '/x?b=1', '/x?c=1'], { maxShapes: 2 }); assert.ok(r.endpoints[0].findings.includes('shape-fragmentation')); });
test('does not expose query values', () => { const r = analyze(['https://x.test/a?token=hunter2']); assert.equal(JSON.stringify(r).includes('hunter2'), false); });
