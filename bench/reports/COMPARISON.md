# Comparison Summary (historical)

Ops/sec across the three measured stages:

| Scenario | 01-baseline-accuracy | 02-speed-opt-1 | 03-speed-opt-2 | vs baseline |
|----------|---------------------:|---------------:|---------------:|------------:|
| shortFa | 466,465 | 2,024,414 | 14,776,141 | ~32× |
| shortMixed | 337,269 | 1,425,202 | 1,962,760 | ~6× |
| medium | 191,667 | 605,694 | 1,160,865 | ~6× |
| long | 75,575 | 211,077 | 347,918 | ~5× |
| veryLong | 5,011 | 12,006 | 25,420 | ~5× |
| markdown | 172,675 | 411,833 | 571,588 | ~3× |
| mixedWorkload | 4,120 | 11,356 | 21,289 | ~5× |

Source report files:
- `2026-08-01T01-00-00-000Z_01-baseline-accuracy.*`
- `2026-08-01T01-10-00-000Z_02-speed-opt-1.*`
- `2026-08-01T01-20-00-000Z_03-speed-opt-2.*`
