# Performance harness

Browser-based micro-benchmarks for the heavier components. They measure the
**synchronous JS cost** of an operation (the part the component controls);
layout/paint is additional and browser-driven.

## Run

Serve the library over HTTP (ES modules must be served, not opened as files):

```bash
# from the repo root (prism-design-system/)
python3 serve.py            # http://localhost:4599
```

Then open:

```
http://localhost:4599/design-system-library/bench/data-table.bench.html
```

Results render on the page and are logged to the console as JSON
(`window.__benchResults` holds the raw timings).

## Parameters (query string)

| Param   | Default | Meaning                          |
|---------|---------|----------------------------------|
| `rows`  | `100`   | rows in the table (all rendered) |
| `iter`  | `30`    | timed iterations per operation   |

Scale it to see where the linear cost starts to hurt:

```
…/data-table.bench.html?rows=1000
…/data-table.bench.html?rows=10000
```

## Reading it

- **Median** is the headline number; **p95/max** show jitter.
- Green = under ~4ms; plain = under one 60fps frame (16.7ms); amber/red = over.
- The verdict line flags whether the worst operation stays within a frame — i.e.
  whether row virtualization is worth adding at that size.

## Baseline (100 rows, all in the DOM)

| Operation                 | Median | p95   |
|---------------------------|--------|-------|
| Cold mount + full render  | ~9 ms  | ~12 ms |
| Row re-render (`.rows`)   | ~0.4 ms| ~1 ms |
| Sort (client-side)        | ~3.7 ms| ~8 ms |
| Search filter             | ~0.3 ms| ~2 ms |
| Paginate                  | ~0.2 ms| ~2 ms |

All comfortably within a frame at 100 rows — no virtualization needed at this
size. Numbers vary by machine; re-run to get your own baseline.
