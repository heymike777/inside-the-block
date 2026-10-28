# Measurement report

Generated: 2026-10-28T22:45:44.305Z

Unique attempts: 1728. Eligible successful on-target transactions: 1708.
Validators: 6; exact version strings: 3. Measurement dates (UTC): 2026-10-28.
Finalized transaction fees: 9233280 lamports. This does not include unresolved reservations, wallet funding or other campaigns.

## Coverage gate

Minimum identity/version counts met. Advertised client IDs and per-condition coverage are reported separately; they are not binary attestations.

## Per-validator coverage

| Identity | Version(s) | Advertised clientId(s) | Eligible transactions | Leader windows | All four in one block |
|---|---|---|---:|---:|---:|
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 4.3.2 | HarmonicAgave | 288 | 72 | 53 |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 26.10.5 | FireBAM | 286 | 72 | 47 |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 26.10.4 | Firedancer | 286 | 72 | 50 |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 4.3.2 | JitoLabs | 276 | 70 | 52 |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 26.10.4 | HarmonicFiredancer | 284 | 71 | 53 |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 26.10.5 | Firedancer | 288 | 72 | 39 |

## What went wrong

Unresolved: 0.
Failed on chain: 0.
Landed on another leader: 20.

Review events.jsonl for missed windows, RPC errors, simulation failures and reservation totals. Missing observations are not random; compare landing rates by treatment before interpreting ordering.

## Findings

No causal scheduler rule is automatically inferred. Inspect analysis.json by validator, version, slot and batch. Pair counts within a batch are dependent. A version string alone cannot establish a client family.

## Limits

RPC forwarding and transport delay are not observed at the validator. Block serialization is observable; internal scheduling decisions and exact execution start times are not. Cross-slot order is excluded. Failed, unresolved, off-target and synthetic rows are excluded from ordering comparisons. Block competition, packet loss and account locks can affect inclusion. Do not mix upgrade regimes.
