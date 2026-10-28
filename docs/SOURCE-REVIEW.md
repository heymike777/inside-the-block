# Source review — 2026-10-28

The experiment measures public block serialization. It does not inspect the binaries actually running on remote validators. Gossip version strings identify measurement strata; they do not establish the operator's scheduler configuration, fork ancestry or an unmodified build.

## Agave reference

The [v4.3.2 priority implementation](https://github.com/anza-xyz/agave/blob/v4.3.2/core/src/transaction_priority.rs) computes a reward-to-cost ratio with integer scaling. Cost comes from the runtime cost model, and reward comes from the bank's fee accounting. Therefore CU price alone is an incomplete general predictor. Our same-message price sweep holds requested resources fixed; the limit and equal-total-priority-fee sweeps probe sensitivity to requested resources.

The [v4.3.2 ingress implementation](https://github.com/anza-xyz/agave/blob/v4.3.2/core/src/banking_stage/transaction_scheduler/receive_and_buffer.rs) computes priority when validating and buffering packets. It also validates account locks and fee payer eligibility. This is one reason an observation of higher fee landing later cannot by itself refute a priority queue: that transaction may have reached the queue later or been unable to acquire resources.

The [v4.3.2 priority identifier](https://github.com/anza-xyz/agave/blob/v4.3.2/core/src/banking_stage/transaction_scheduler/transaction_priority_id.rs) orders by priority, then an internal transaction identifier. That internal ID is not recorded by this experiment; local send order is not a valid substitute for it.

The [current greedy scheduler](https://github.com/anza-xyz/agave/blob/master/core/src/banking_stage/transaction_scheduler/greedy_scheduler.rs) attempts priority order subject to immediately available account locks and thread capacity. This moving-branch source is contextual only, not proof of the measured release or remote configuration. Queue order, execution timing and serialized block order can differ.

## Other version strings

The measured 26.10.4 and 26.10.5 strings are retained exactly as reported by getClusterNodes. We do not infer Jito, Firedancer or a custom fork solely from those numbers. A guessed Firedancer tag was not available during source review; that is not evidence of client identity. The submission relies on the bounty's explicit allowance for identifiable distinct version strings, rather than claiming three independently established client families.

Firedancer's [current pack implementation](https://github.com/firedancer-io/firedancer/blob/main/src/disco/pack/fd_pack.c) also has reward and compute-estimate ordering fields, but no measured validator is attributed to this implementation in the report. No Jito bundle API or tip transfer is used anywhere in the experiment.

## Hypotheses and interpretation

Within each validator/version/lock/treatment stratum, compare four descriptive predictors: higher CU price, higher total priority fee, lower requested CU limit and earlier local dispatch. Ties in a predictor carry no ordering information. Compare only pairs in the same finalized block. Bootstrap whole leader windows, not transaction pairs. Report partial landing and selection bias. Intervals are exploratory, marginal, and unreliable with very few windows; they do not establish causal scheduler rules.

The primary design has fixed-size unique memos and a seeded randomized dispatch order. Shared-payer and independent-payer batches are reported separately. Treatment batches currently run in grouped sequence; time-varying load may confound cross-treatment comparisons. No claim is made that block order measures exact start time, that RPC forwarding reveals validator arrival, or that three version strings imply three client families.

## Attribution correction and expansion

The original version-only attribution was incomplete. Raw getClusterNodes snapshots already included clientId. The temporal join now confirms five advertised variants for the six selected identities, corroborated by a dated Firedancer report; see [CLIENT-ATTRIBUTION.md](CLIENT-ATTRIBUTION.md). That supersedes the earlier statement that only version-string evidence was available. It does not constitute binary attestation or prove the active external-builder mode. The baseline remains separate from the new 12-repeat, interleaved expanded-v3 confirmation series.
