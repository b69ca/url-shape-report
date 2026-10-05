# url-shape-report

Cluster URLs by normalized endpoint and query-key shape, then flag endpoints whose query contracts are fragmenting.

Query values are never retained or printed. Numeric, UUID, and long hexadecimal path segments are normalized so individual resources group together.

## Run

```bash
cat urls.txt | npx --yes github:b69ca/url-shape-report -
npx --yes github:b69ca/url-shape-report requests.jsonl --json-path request.url --fail
```

Plain input is one URL per line. `--json-path` reads URLs from a dot-separated field in JSONL instead.

## Options

```text
--json-path PATH  read each URL from JSONL
--max-shapes N    shapes allowed per endpoint (default 4)
--max-keys N      distinct keys allowed per endpoint (default 12)
--json            emit machine-readable JSON
--fail            exit 1 when findings exist
```

Findings include excessive query shapes, high key cardinality, and mostly-singleton keys—a common sign that values are accidentally being encoded as parameter names.

All processing is local. Node.js 20 or newer; no runtime dependencies.

## License

MIT
