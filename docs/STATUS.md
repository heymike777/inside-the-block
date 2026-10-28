# Work log — 2026-10-28

- Bounty requirements reviewed and experiment plan implemented.
- RPC supplied locally via `.env`; endpoint credentials never printed.
- Mainnet genesis verified; 638 candidates with upcoming slots discovered.
- Six target identities selected across three exact versions in config.json. Client family attribution remains unverified.
- Offline tests verify signed transaction construction, repeatable treatment balancing, persistent cap behavior and within-block grouping.
- No live transactions sent. No measured scheduler rule claimed.
- Docker CLI unavailable locally; Compose files supplied but not run.

Remaining: funded four-payer pilot, verify simulation/landing and fee budget; refine delivery based on pilot; implement window-level inference and source review; collect complete six-validator main dataset; finalize report and reviewed raw-data export; publish repository and submit.

Dry-run completed after timing correction: 8 signed probes across 2 leader windows; 0 sendTransaction calls and 0 lamports reserved. Unfunded simulations returned AccountNotFound as expected. Run: data/4c6849ad-3379-4b07-87b0-aefa05d743cc. Four dedicated local keypairs created (0600 permissions); public addresses in data/payer-addresses.json. Main run cap lowered to 0.049 SOL to leave room for setup fees.

## Live campaign

- Repository discovered at https://github.com/heymike777/inside-the-block (initial commit 9c44dfb).
- Pilot v1: 8 finalized on-target successful transactions, 44,440 lamports. Long memo exhausted the 10,000-CU simulation before further sending; no failed on-chain transaction resulted.
- Memo shortened to a fixed 16-character hash; funded preflight passed all 10 unique budgets. Burst dispatch introduced to improve same-block comparisons.
- Main v2 run 1378aaaf-b2b5-48bf-bd7c-54ae8c8c8ed1: 216 submitted and finalized transactions, 1,158,520 lamports, six identities / three exact versions. Losslessly exported to results/main-01 with hashes; offline verification passed.
- Continuation e7faec4d-8e7e-4689-87cf-31efd4862e15 resumes only unattempted batches under the same journal. Complete planned v2 campaign: 288 transactions, 12 four-probe batches per validator.
- Exploratory confidence intervals are withheld below five informative windows; the current two-repeat cells support descriptive summaries only.

- Main v2 continuation e7faec4d-8e7e-4689-87cf-31efd4862e15 finalized 48 additional probes. A read-only collection request returned HTTP 502; a later read completed successfully. No transaction was resent. Main-02 exported after successful final collection; an earlier incomplete local preview is retained only under ignored data/.
- Final continuation 4176cb53-e1fe-4aa3-beb8-5fa4e835fb67 contains only the last six independent-payer batches of the sixth validator.
- GitHub CI run 40712608727 verified Docker build, dry-run, tests and replay successfully.

## Completed campaign

All 288 primary probes finalized: 280 on-target, 8 off-target, 0 failed, 0 unresolved. Six identities, three exact version strings, 12 attempted batches per identity. Primary fees 1,538,880 lamports; pilot 44,440; total 1,583,320, exactly matching reservations. Three main datasets, pilot, discovery and accounting exported with integrity manifests. Final report explicitly withholds causal scheduler claims and intervals with fewer than five informative windows.
