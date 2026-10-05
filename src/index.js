const idSegment = value => /^\d+$/.test(value) ? ':number' : /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value) ? ':uuid' : /^[0-9a-f]{16,}$/i.test(value) ? ':hex' : value;
export function endpointOf(input) {
  const url = new URL(input, 'http://relative.invalid');
  const path = url.pathname.split('/').map(idSegment).join('/') || '/';
  return `${url.host === 'relative.invalid' ? '' : url.origin}${path}`;
}
export function shapeOf(input) {
  const url = new URL(input, 'http://relative.invalid');
  return [...new Set([...url.searchParams.keys()])].sort().join('&') || '(none)';
}
export function analyze(urls, { maxShapes = 4, maxKeys = 12 } = {}) {
  if (!Array.isArray(urls) || !urls.length) throw new Error('at least one URL is required');
  const groups = new Map();
  for (const input of urls) {
    let endpoint, shape;
    try { endpoint = endpointOf(input); shape = shapeOf(input); } catch { throw new Error('input contains an invalid URL'); }
    const g = groups.get(endpoint) || { endpoint, requests: 0, shapes: new Map(), keys: new Map() };
    g.requests++; g.shapes.set(shape, (g.shapes.get(shape) || 0) + 1);
    if (shape !== '(none)') for (const key of shape.split('&')) g.keys.set(key, (g.keys.get(key) || 0) + 1);
    groups.set(endpoint, g);
  }
  const endpoints = [...groups.values()].map(g => {
    const findings = [];
    if (g.shapes.size > maxShapes) findings.push('shape-fragmentation');
    if (g.keys.size > maxKeys) findings.push('high-key-cardinality');
    const singletonKeys = [...g.keys.values()].filter(n => n === 1).length;
    if (singletonKeys >= 3 && singletonKeys / g.keys.size >= 0.5) findings.push('mostly-singleton-keys');
    return { endpoint: g.endpoint, requests: g.requests, shapeCount: g.shapes.size, keyCount: g.keys.size, singletonKeyCount: singletonKeys, findings, shapes: [...g.shapes].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([shape, count]) => ({ shape, count })) };
  }).sort((a, b) => b.findings.length - a.findings.length || a.endpoint.localeCompare(b.endpoint));
  return { urlCount: urls.length, endpointCount: endpoints.length, findingCount: endpoints.reduce((n, x) => n + x.findings.length, 0), endpoints };
}
