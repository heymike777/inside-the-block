# Inside the Block

Reproducible Solana mainnet transaction-ordering experiment for the [Superteam Ukraine bounty](https://superteam.fun/earn/listing/inside-the-block-how-solana-validators-order-transactions/).

**Status: live pilot verified; mainnet measurement campaign in progress.** The default command never submits transactions. Synthetic/demo output is never evidence. Mainnet transactions cost SOL only with the explicit `run … --live` flag and four locally mounted keypairs.

## Run

Node.js 24+:

```sh
npm ci
npm test
npm start
```

One-command default with Docker Compose:

```sh
docker compose run --rm --build experiment
```

This writes the deterministic preregistered design to `data/plan.json`. Docker must be installed. Local verification on 2026-10-28 used Node; Docker was unavailable, so container execution has not been verified.

Put `RPC_URL` in `.env` (see `.env.example`). Never commit it. Discovery is read-only:

```sh
node --env-file=.env src/cli.mjs discover
```

`data/candidates.json` contains a timestamped gossip snapshot, version strings, stake and future leader slots. Select at least six identities across three exact versions in `config.json`; re-run discovery before a campaign. Verify client/fork attribution separately using dated validators.app evidence or operator/source evidence. We do **not** label Jito from a generic Agave-like version number.

```sh
node --env-file=.env src/cli.mjs run config.json
```

Dry-run uses four ephemeral, unfunded signers, builds and signs actual transactions, simulates them, quotes fees and follows real future leader windows. Balance-related simulation errors are retained and expected. These do not prove successful execution by funded payers. The `preflight` command simulates all unique probe budgets using funded payers without submitting transactions. The current epoch is used, and a run is bounded by `maxWaitSeconds`; it can finish with incomplete coverage. Read `events.jsonl` rather than assuming every planned batch ran.

## Live measurements

Supply four **dedicated, independently funded** Solana CLI JSON keypair files via `KEYPAIR_PATHS` (comma separated) in `.env`. They must have different addresses. Do not paste seeds or private keys into chat or commit keypair files. The program does not create or fund wallets, transfer SOL, send Jito bundles, or pay tips. Probe transactions consist only of compute budget instructions and a unique memo. Funding and later withdrawal are separate operations with their own costs and must be recorded in the final campaign budget.

Generate dedicated local wallets if needed with `node src/cli.mjs wallets` (refuses to overwrite existing keys). Only public addresses are written to `data/payer-addresses.json`.

The live command is deliberately explicit:

```sh
node --env-file=.env src/cli.mjs run config.json --live
```

For Docker, mount keys under `secrets/` (read-only in the container), set `KEYPAIR_PATHS` to four `/run/secrets/…` paths, in `.env`. The same live command can be passed as service arguments. The standard Compose command is always dry-run.

The cap is at most **50,000,000 lamports (0.05 SOL)**. A persistent, fsynced journal reserves each exact `getFeeForMessage` quote **before** submission. Timeouts and failed submissions keep their reservations. There are no automatic resends, and RPC retries are disabled. An exclusive `data/live.lock` prevents concurrent runs sharing the same journal. A crashed process leaves the lock: verify no live process remains before manually removing it. Never delete/move the journal, change OUTPUT_DIR, or use separate copies during one campaign: the cap is scoped to that persistent directory, not globally to a wallet. Do not use these wallets elsewhere during the experiment. Leave room under 0.05 SOL for funding/withdrawal fees.

Simulation must succeed and balances and version strings are checked before live sending. Runs reject non-mainnet genesis hashes. This implementation sends version-0 transactions, obtains quotes for their actual messages, and records execution errors rather than dropping failed transactions from the raw dataset.

## Collect and report

Run collection after finalization; it is read-only and can be repeated:

```sh
node --env-file=.env src/cli.mjs collect data/RUN_ID
node src/cli.mjs verify data/RUN_ID
node src/cli.mjs report data/RUN_ID/observations.jsonl
```

Pass multiple observation files to `report` to combine runs; signatures are deduplicated. Collection preserves unresolved attempts, stores full finalized `getBlock` responses and checks the signature's exact transaction index and actual slot leader. Transactions forwarded into another leader's block are kept, but excluded from the target-validator comparison. Later collector runs overwrite observations as statuses become known, while RPC logs are append-only.

Raw logs contain public addresses/signatures, slot numbers, request parameters, UTC timestamps, RPC latency, compute budgets, payer assignments, send order and acknowledgements. They exclude the endpoint URL and private keys. Review data before publishing, preserve all measurement raw data and manifests, and include the finalized `block-*.json` files. `data/` is ignored during development so accidental intermediate logs cannot be committed; explicitly add a reviewed `results/` dataset before submission.

## Experiment design

The seed fixes shuffled send order. Each validator has 72 batches / 288 transactions by default: two account-lock modes × three treatments × twelve repetitions. One four-transaction batch is attempted per leader window. A full six-validator design attempts 1,728 probes; quoted fees, not a hardcoded base-fee assumption, control admission. Repeated runs currently restart the design, so distinct runs must be treated as repetitions, not independent randomized designs; record each seed and run ID.

- **Price:** 20,000 requested CU, four CU prices, randomized send order.
- **Limit:** four requested CU limits at the same CU price. This changes both requested resources and total priority fee.
- **Equal fee:** four requested CU limits with inverse prices, all giving 100 lamports priority fee. This helps separate total fee from requested budget, but not every scheduler-cost term.
- **Locks:** common payer serializes writable access; independent payers avoid that shared writable account. Payer assignments rotate across repetitions so fee level is not permanently tied to a payer. Transactions have no additional writable accounts.

Leader slots come from the real epoch schedule. Preparation happens near a window with a fresh blockhash. The runner polls the processed slot, rechecks client version, then rechecks slot before sending. Sequential RPC sends establish client send order and unique transaction identity; RPC acknowledgements do **not** establish arrival order at the leader. `maxRetries=0` avoids requested RPC rebroadcast but does not expose provider forwarding behavior. No direct TPU path is implemented. The pilot used sequential sends; `main.config.json` uses concurrent burst dispatch with randomized launch order. Those phases are analyzed separately. Timing favors auditable missed-window logging over claiming exact arrival control. All contiguous leader slots are accepted, not just the first slot.

Block order means the transaction index returned by `getBlock`, not measured execution start time. Primary evidence is exclusively our own probes. Other block transactions provide competition context; they are not a substitute for probes. Compare landing rates and failures alongside order; conditioning on successful same-block pairs can introduce selection bias.

The analyzer reports descriptive pair counts for CU price within validator/version/slot/batch. It does not pool blocks, compute misleading transaction-level p-values, or infer a scheduler implementation. The report additionally writes `window-statistics.json`, comparing CU price, total priority fee, requested CU and dispatch order with equal-weight leader-window concordance and 2,000 seeded cluster-bootstrap resamples. Intervals are exploratory and marginal, without multiplicity correction. Very small window counts cannot support strong conclusions. Review full-block load and selection effects manually. See `docs/SOURCE-REVIEW.md` for the reference scheduler and attribution limits.

## Upgrade regime and submission

Collect the entire campaign on one side of the bounty's October 21 upgrade boundary. This project starts October 28, 2026 and intends post-upgrade measurements only. Preserve dates and chain evidence; do not combine older external datasets into the primary sample.

The final submission needs six measured validators, three evidenced version strings/forks, repeated on-target windows, dated raw signatures/slots, a report with null results and a “what went wrong” section, source review against the relevant pinned client releases, and a public repository URL. Meeting discovery counts is not meeting measurement counts. Regional eligibility and final submission are the participant's responsibility.

Sources: [bounty specification](https://superteam.fun/earn/listing/inside-the-block-how-solana-validators-order-transactions/), [Solana fees](https://solana.com/docs/core/fees), [getClusterNodes](https://solana.com/docs/rpc/http/getclusternodes), [Alpenglow upgrade](https://solana.com/nl/upgrades/alpenglow). Accessed 2026-10-28.

## Current campaign

`main.config.json` fixes the v2 campaign at two repeats per lock/treatment, 12 batches per validator, 288 planned transactions in total. The default `plan` command retains a larger 12-repeat design for future replication. A main run is bounded to ten minutes; `resumeFrom` can name earlier run directories with matching design hash, phase and send mode. Already attempted batches are skipped (including ambiguous sends), and the same global budget journal remains in force. A partial batch is not silently retried.

The v1 pilot used a longer memo and sequential RPC sends. Its 10,000-CU cell failed simulation before submission; already sent price-sweep transactions were retained. All v2 probes use a 16-character ASCII digest memo. The funded preflight simulated every unique compute-budget/price combination successfully. The chain now contains version-1 transactions from other users, so collection advertises maxSupportedTransactionVersion=1 while our own probes remain version 0.

After a run finishes, export reviewed raw evidence with:

```sh
node src/cli.mjs export data/RUN_ID results/main
node src/cli.mjs reproduce results/main
# Container equivalent (requires Docker):
docker compose run --rm --build experiment reproduce /app/results/main
```

Export compresses RPC logs and block files losslessly and records original/stored SHA-256 hashes in `integrity.json`. The offline verifier reads plain or gzip blocks. There is no network call or live submission in `reproduce`. If a campaign spans multiple runs, export each run separately and pass all observation files to `report`; never combine pilot and main phases.
