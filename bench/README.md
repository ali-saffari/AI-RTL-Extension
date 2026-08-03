# Direction Algorithm Benchmarks

## Run

```bash
node bench/run.js
BENCH_LABEL=after-opt node bench/run.js
```

Reports are written to `bench/reports/` as `.json` and `.md`.

## Historical snapshots

| File prefix | Label | Meaning |
|-------------|-------|---------|
| `2026-08-01T01-00-00` | `01-baseline-accuracy` | After accuracy fixes, before speed opts |
| `2026-08-01T01-10-00` | `02-speed-opt-1` | First speed optimization |
| `2026-08-01T01-20-00` | `03-speed-opt-2` | Second speed optimization (quick probe + flags) |
