# Measurement report

Generated: 2026-10-28T18:44:53.574Z

Unique attempts: 288. Eligible successful on-target transactions: 280.
Validators: 6; exact version strings: 3. Measurement dates (UTC): 2026-10-28.
Finalized transaction fees: 1538880 lamports. This does not include unresolved reservations, wallet funding or other campaigns.

## Coverage gate

Minimum validator/version counts met. Fork attribution and repeated-window coverage still require review.

## Per-validator coverage

| Identity | Version | Eligible transactions | Leader windows | All four in one block |
|---|---|---:|---:|---:|
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 4.3.2 | 44 | 11 | 8 |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 26.10.5 | 48 | 12 | 6 |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 26.10.4 | 48 | 12 | 10 |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 26.10.4 | 48 | 12 | 10 |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 4.3.2 | 44 | 11 | 11 |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 26.10.5 | 48 | 12 | 8 |

## What went wrong

Unresolved: 0.
Failed on chain: 0.
Landed on another leader: 8.

Review events.jsonl for missed windows, RPC errors, simulation failures and reservation totals. Missing observations are not random; compare landing rates by treatment before interpreting ordering.

## Findings

No causal scheduler rule is automatically inferred. Inspect analysis.json by validator, version, slot and batch. Pair counts within a batch are dependent. A version string alone cannot establish a client family.

## Limits

RPC forwarding and transport delay are not observed at the validator. Block serialization is observable; internal scheduling decisions and exact execution start times are not. Cross-slot order is excluded. Failed, unresolved, off-target and synthetic rows are excluded from ordering comparisons. Block competition, packet loss and account locks can affect inclusion. Do not mix upgrade regimes.
