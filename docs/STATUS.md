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
