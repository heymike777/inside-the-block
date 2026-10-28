# Inside the Block: measured ordering under RPC forwarding

Measurement dates: 2026-10-28 (UTC). Experiment phase: expanded-v3.

## Result

The observable is the serialized position of our own successful transactions in finalized blocks. This dataset does not identify a unique internal scheduler rule: arrival at the leader is unobserved, and priority is not the only scheduling constraint. The tables quantify how well simple predictors match observed order for each sampled validator/version. A counterexample to global fee-sorted block order is not a counterexample to a queue that prioritizes the transactions available at a particular instant.

Recorded attempts: 1728. Successful on-target observations: 1708. Distinct on-target identities: 6. Distinct exact version strings: 3. Distinct advertised clientIds: 5.

## Per-validator price sweep

Within each window, score concordant same-block pairs / all informative same-block pairs, then average windows equally. Higher CU price is the candidate prediction. A score of 1 means all compared pairs in the observed sample agree; it does not prove the rule. A score near 0.5 is not proof of randomness. This dataset contains 12 observed repeat identifiers. Confidence intervals are withheld below five informative windows; shown intervals are exploratory and marginal, without multiplicity correction.

| Validator | Version | Advertised clientId | Locks | Informative windows | Mean price concordance | Exploratory 95% interval |
|---|---|---|---|---:|---:|---|
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 4.3.2 | HarmonicAgave | shared-payer | 12 | 0.819 | 0.694–0.931 |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 26.10.4 | Firedancer | independent-payers | 12 | 0.833 | 0.736–0.931 |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 4.3.2 | JitoLabs | independent-payers | 12 | 0.472 | 0.306–0.653 |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 4.3.2 | JitoLabs | shared-payer | 11 | 0.455 | 0.258–0.652 |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 26.10.5 | FireBAM | shared-payer | 12 | 0.708 | 0.542–0.861 |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 26.10.4 | HarmonicFiredancer | independent-payers | 12 | 0.528 | 0.375–0.694 |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 26.10.4 | HarmonicFiredancer | shared-payer | 12 | 0.819 | 0.736–0.903 |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 26.10.4 | Firedancer | shared-payer | 12 | 0.736 | 0.597–0.875 |
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 4.3.2 | HarmonicAgave | independent-payers | 12 | 0.458 | 0.319–0.611 |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 26.10.5 | FireBAM | independent-payers | 12 | 0.583 | 0.472–0.708 |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 26.10.5 | Firedancer | shared-payer | 12 | 0.500 | 0.333–0.653 |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 26.10.5 | Firedancer | independent-payers | 12 | 0.583 | 0.444–0.708 |

## Verifiable price inversions

For each identity below, these two successful probes share a finalized block. The lower-priced probe serialized first. Signatures and indices can be checked directly with getBlock. This establishes only an observed inversion under our delivery path, not its cause.

| Validator | Slot | Earlier index / price | Later index / price | Earlier signature | Later signature |
|---|---:|---|---|---|---|
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 462575398 | 126 / 0 | 230 / 1000 | 3AU3FYUoooXeKzbxVKGRcL9yd5rdCr33zVqGVqypn25awQJS3NDcwh7iz1oYcLpaRPdhAQ3GwyyW5a1Scccngbn9 | 4R2nFAopLazfGGKxP7wEG1i4gbo7h4CQH1UvQoXgWTCkhvgAtUUYxoGig5cr3CrD5GybteZHbTTkrFRybNH9etZH |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 462576073 | 235 / 10000 | 344 / 100000 | NhUvhpnD9jYVSz7CfM88fqaJV6ER3kNdAvPH9b6MLyxzf9XzimmEq1UkuuM2Xs6fbRuRnz9Ba6YyiwPFrF6FcjQ | 64n3vRYDULSpja94WyivCYYpZSgHgQA5cAKwPyWDNrfmnzK5PeewFQ7N6zd13Toa5mm9t6qFP2bRytaMQydwCkNV |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 462576078 | 243 / 1000 | 246 / 100000 | 2MfpLKniKnRwDGvhE9XBkzDRx2dbFXpp3WW7HTSd2WhnPUfmAeNDqj3JRDsmquqqhA8pZ7mj3mieKvu41JffkGbW | 2Pawz3MMMPLC7gaHQeYNPHKfZCzE6FuWhgrjzQyTnSP37JhQ55wqAhrB2JP3PQQnbPt1ZkmtxzvqpV7hmHU76qKg |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 462575617 | 194 / 0 | 228 / 100000 | 9otHK5V4tNAKqNfc9vaqYeiAHDiEL6r7mcm1Z547JAxPRdndsaQQYVVq4zj7sDE4KqbyVtxcbKpFLjiydDCaztR | 5pBRzP3FVDW23RnQ2tD1nF7KDjX5D16rWzQrKVPwPAnfpT2VQUJgqG1xvDwnSiiA3aTgQsAMb6cAHcPUMi2g3CuM |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 462575638 | 212 / 0 | 218 / 1000 | 3rUDJm5fJj3XLPi6dySxkBJ1bwDwbja6WYFDWUdS83hy58c3XiKnBwjQ1atgFummk4T2sK3WM2jHxFAaYxJzMVej | 3HoWKF8BVZU8MifR4vXs4QGrpm8gSat4d1ZQLdMZw9XSZaBevKbGFG85Kt9Ax5mJK2xppUCT6gC8hcpoCvJ78fNJ |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 462579522 | 15 / 0 | 21 / 1000 | 5Gs4DohFcxY6258SH7sBzfibWcc99xxGi1VdGamgGusi2BNErkQ3XRFxnV45pMbBaaKdfKQYvLH6RoxpN6ykoe6E | 5ivCZSxvaTBrc2DWE1HveZRB2pa8LGkdVcusq3XcUJzgZyQtPXpavnXYCA1pBfsrTuXsJP65XtFVph7Ninef8W3d |

## Interpretation of the other treatments

The fixed-price limit sweep changes both requested CU and total priority fee. The equal-priority-fee sweep holds the total at 100 lamports while inversely changing CU price and CU limit; those two factors remain collinear and cannot be independently identified from that sweep. See [window-statistics.json](results/expanded-analysis/window-statistics.json) for all four candidate predictors by lock mode and treatment. Independent payers remove the shared writable fee payer, but also introduce payer-specific balance/path differences. Payer assignments rotate across repeats.

## Other candidate predictors

Each cell is mean window concordance followed by the number of informative windows. Lower requested CU is the candidate prediction in the two resource sweeps; earlier local dispatch is compared only in the fixed-resource price sweep. These are descriptive comparisons, not isolated causal effects.

| Validator prefix | Locks | Lower CU at fixed price | Lower CU at equal priority fee | Earlier dispatch in price sweep |
|---|---|---|---|---|
| Fd7btgyS… | shared-payer | 0.792 (n=12) | 0.833 (n=12) | 0.583 (n=12) |
| 9jxgosAf… | shared-payer | 0.806 (n=12) | 0.847 (n=12) | 0.639 (n=12) |
| 9eGrDohd… | independent-payers | 0.792 (n=12) | 0.875 (n=12) | 0.597 (n=12) |
| Fd7btgyS… | independent-payers | 0.667 (n=12) | 0.542 (n=12) | 0.625 (n=12) |
| HEL1USMZ… | independent-payers | 0.569 (n=12) | 0.652 (n=11) | 0.556 (n=12) |
| JUPiTERr… | shared-payer | 0.847 (n=12) | 0.819 (n=12) | 0.556 (n=12) |
| HEL1USMZ… | shared-payer | 0.500 (n=12) | 0.561 (n=11) | 0.636 (n=11) |
| 9jxgosAf… | independent-payers | 0.708 (n=12) | 0.778 (n=12) | 0.708 (n=12) |
| JUPiTERr… | independent-payers | 0.621 (n=11) | 0.792 (n=12) | 0.639 (n=12) |
| 9eGrDohd… | shared-payer | 0.903 (n=12) | 0.903 (n=12) | 0.569 (n=12) |
| DNVZMSqe… | independent-payers | 0.403 (n=12) | 0.500 (n=12) | 0.722 (n=12) |
| DNVZMSqe… | shared-payer | 0.528 (n=12) | 0.653 (n=12) | 0.528 (n=12) |

## What went wrong

The v1 pilot used long memos and sequential sends. It recorded eight successful on-target transactions before a low-CU simulation failed. That simulation prevented further submissions. The baseline main-v2 and confirmation expanded-v3 campaigns use fixed-size short memos and burst dispatch, after all ten unique probe budgets passed funded simulation. Pilot data is exported separately and never pooled into the primary analysis.

Finalized off-target observations: 20. Failed on-chain observations: 0. Unresolved attempts: 0.

Collection encountered one HTTP 502 from getSignatureStatuses; reading was repeated successfully. No submission was repeated because of that error. Later collector code records transient HTTP errors and retries read-only requests at most twice, while sendTransaction remains single-attempt.

Some bursts straddled blocks or landed on another leader despite targeting a leader window. Such cases remain in raw data. Only same-block, successful on-target pairs contribute to ordering scores; this conditioning may bias the sample. Missing cells or partial batches are visible in [report.md](results/expanded-analysis/report.md) and must not be interpreted as negative evidence.

## Reproduction and evidence

Run npm ci, npm test, then the documented reproduce command against every exported main run. Exported integrity.json records SHA-256 hashes. Each observation points to a saved full block and signature index. RPC logs, attempts, window events and configuration manifests preserve the measurement provenance. The spend reservation journal covers pilot and all main runs; raw finalized fees and reserved fees are different accounting quantities.

## Source context and limits

Agave v4.3.2 computes priority from bank reward divided by cost, with integer scaling; a CU-price-only model is incomplete outside a fixed-resource sweep. See [the source review](docs/SOURCE-REVIEW.md) for source links and lock/thread constraints. Where available, advertised clientId is joined from the last successful getClusterNodes snapshot at or before each dispatch; each derived row identifies the raw record and its hash. See [client attribution](docs/CLIENT-ATTRIBUTION.md) for the monitor cross-check and freshness limits. Numeric versions alone do not identify a fork, and advertised IDs do not attest the remote binary or active scheduling mode.

Measurement dates (UTC): 2026-10-28. The intended campaign is entirely after the October 21, 2026 upgrade; check the raw slots and timestamps. Transport path, provider forwarding, packet timing at the leader and internal worker scheduling remain unobserved. The baseline used grouped treatments; expanded-v3 interleaves all six conditions in seeded per-validator rounds. The phases remain separate. Time-varying load, route and operator configuration remain possible confounders. No global causal scheduler rule or claim of random ordering is established. Larger repeated, interleaved measurements and a second delivery path are the most valuable next experiment.

## Expanded campaign coverage and accounting

All 1728 planned probes finalized. 1708 succeeded on the intended leader; 20 landed elsewhere; 0 failed on chain. There were 432 attempted leader-window batches, of which 294 put all four successful probes in one intended-leader block.

Expanded probe fees: 9233280 lamports. Baseline plus pilot: 1583320. Cumulative finalized probe fees: 10816600; conservative reservations: 10816600; enforced cap: 49000000. See [accounting and coverage](results/expanded-summary.json) and the lossless reservation journal.

Observed blocks: 567; median transaction count 443; median sum of reported consumed CU 14918973. These quantities describe sampled blocks, not the leader's queue or cost-limit headroom.

## Baseline versus separately collected confirmation series

The earlier 2-repeat baseline and this 12-repeat confirmation series are shown separately, never pooled. Conditions were grouped in the baseline and interleaved in the confirmation series; times and network conditions differ. Differences below are descriptive and are not paired causal client effects. The identities and candidate predictors were fixed before expanded capture; no scheduler model was tuned on these results.

| Identity prefix | Advertised clientId | Locks | Baseline price concordance | Expanded price concordance | Expanded marginal 95% interval |
|---|---|---|---|---|---|
| Fd7btgyS… | HarmonicAgave | shared-payer | 0.833 (n=2) | 0.819 (n=12) | 0.694–0.931 |
| 9eGrDohd… | Firedancer | independent-payers | 0.667 (n=2) | 0.833 (n=12) | 0.736–0.931 |
| HEL1USMZ… | JitoLabs | independent-payers | 0.750 (n=2) | 0.472 (n=12) | 0.306–0.653 |
| HEL1USMZ… | JitoLabs | shared-payer | 0.167 (n=1) | 0.455 (n=11) | 0.258–0.652 |
| 9jxgosAf… | FireBAM | shared-payer | 0.750 (n=2) | 0.708 (n=12) | 0.542–0.861 |
| JUPiTERr… | HarmonicFiredancer | independent-payers | 0.750 (n=2) | 0.528 (n=12) | 0.375–0.694 |
| JUPiTERr… | HarmonicFiredancer | shared-payer | 1.000 (n=2) | 0.819 (n=12) | 0.736–0.903 |
| 9eGrDohd… | Firedancer | shared-payer | 1.000 (n=2) | 0.736 (n=12) | 0.597–0.875 |
| Fd7btgyS… | HarmonicAgave | independent-payers | 0.583 (n=2) | 0.458 (n=12) | 0.319–0.611 |
| 9jxgosAf… | FireBAM | independent-payers | 0.750 (n=2) | 0.583 (n=12) | 0.472–0.708 |
| DNVZMSqe… | Firedancer | shared-payer | 0.500 (n=2) | 0.500 (n=12) | 0.333–0.653 |
| DNVZMSqe… | Firedancer | independent-payers | 0.583 (n=2) | 0.583 (n=12) | 0.444–0.708 |

## Full-burst sensitivity analysis

No eligible probe block contained observations from more than one nominal dispatch window. The primary comparison uses all informative same-block pairs. This stricter sensitivity analysis keeps only batches where all four probes succeeded on the intended leader in a single block. It does not treat transaction pairs as independent replicates. Complete-burst selection can itself depend on congestion and price, so agreement strengthens descriptive robustness without establishing causation.

| Identity prefix | Locks | All informative windows | Complete-burst windows | Complete-burst marginal 95% interval |
|---|---|---|---|---|
| Fd7btgyS… | shared-payer | 0.819 (n=12) | 0.759 (n=9) | 0.630–0.889 |
| 9eGrDohd… | independent-payers | 0.833 (n=12) | 0.818 (n=11) | 0.727–0.909 |
| HEL1USMZ… | independent-payers | 0.472 (n=12) | 0.433 (n=10) | 0.267–0.600 |
| HEL1USMZ… | shared-payer | 0.455 (n=11) | 0.500 (n=10) | 0.300–0.683 |
| 9jxgosAf… | shared-payer | 0.708 (n=12) | 0.685 (n=9) | 0.500–0.852 |
| JUPiTERr… | independent-payers | 0.528 (n=12) | 0.542 (n=8) | 0.354–0.729 |
| JUPiTERr… | shared-payer | 0.819 (n=12) | 0.786 (n=7) | 0.667–0.881 |
| 9eGrDohd… | shared-payer | 0.736 (n=12) | 0.646 (n=8) | 0.500–0.813 |
| Fd7btgyS… | independent-payers | 0.458 (n=12) | 0.396 (n=8) | 0.312–0.500 |
| 9jxgosAf… | independent-payers | 0.583 (n=12) | 0.556 (n=9) | 0.426–0.685 |
| DNVZMSqe… | shared-payer | 0.500 (n=12) | 0.458 (n=8) | 0.292–0.604 |
| DNVZMSqe… | independent-payers | 0.583 (n=12) | 0.667 (n=8) | 0.542–0.792 |

Client IDs are contemporaneous advertisements, not binary attestation or proof of active BAM/Harmonic delegation. Most advertised variants have only one sampled operator; operator, route and client cannot be disentangled causally. Marginal bootstrap intervals have no multiplicity correction and assume exchangeable windows within a stratum. Bounds of 1.000–1.000 reflect the observed resample support, not a guarantee about unseen traffic.

The first expanded sender stopped at its declared four-hour limit with two unattempted batches remaining. A continuation used the same seed, phase, design and persistent budget, skipped prior attempts, and completed only the missing batches. No submitted or ambiguous transaction was resent. [The baseline report](docs/BASELINE-REPORT.md) remains an appendix; raw baseline, pilot and expanded evidence are retained separately.

## Observed price-ordering patterns by identity

These are identity-level descriptive associations under this RPC path, not causal client-family comparisons. A marginal interval above 0.5 describes resample support for positive price concordance; it is not a multiplicity-adjusted hypothesis test or proof of an internal scheduler. All price strata contain inversions, so none is a perfect fee-sorted serialization rule.

| Identity prefix | Advertised clientId | Shared-payer concordance | Independent-payer concordance |
|---|---|---|---|
| Fd7btgyS… | HarmonicAgave | 0.819 (n=12) [0.694–0.931] | 0.458 (n=12) [0.319–0.611] |
| HEL1USMZ… | JitoLabs | 0.455 (n=11) [0.258–0.652] | 0.472 (n=12) [0.306–0.653] |
| JUPiTERr… | HarmonicFiredancer | 0.819 (n=12) [0.736–0.903] | 0.528 (n=12) [0.375–0.694] |
| 9eGrDohd… | Firedancer | 0.736 (n=12) [0.597–0.875] | 0.833 (n=12) [0.736–0.931] |
| 9jxgosAf… | FireBAM | 0.708 (n=12) [0.542–0.861] | 0.583 (n=12) [0.472–0.708] |
| DNVZMSqe… | Firedancer | 0.500 (n=12) [0.333–0.653] | 0.583 (n=12) [0.444–0.708] |

Both mode intervals lie above 0.5 for: 9eGrDohd…. Both mode intervals span 0.5 for: HEL1USMZ…, DNVZMSqe…. These are marginal descriptive interval comparisons, not multiplicity-adjusted tests.

Mode-dependent patterns motivate hypotheses about write contention, parallel serialization, arrival timing and configurable builders; the experiment does not separate those mechanisms. Neither an interval spanning 0.5 nor an inversion proves random internal scheduling.
