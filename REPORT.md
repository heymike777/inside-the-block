> **Baseline report.** A separate 12-repeat confirmation campaign is in progress. Client attribution below is reconstructed from measurement-time raw gossip; see [confidence and monitor cross-check](docs/CLIENT-ATTRIBUTION.md). Expanded results are not yet included.

# Inside the Block: measured ordering under RPC forwarding

Measurement dates: 2026-10-28 (UTC). Experiment phase: main-v2.

## Result

The observable is the serialized position of our own successful transactions in finalized blocks. This dataset does not identify a unique internal scheduler rule: arrival at the leader is unobserved, and priority is not the only scheduling constraint. The tables quantify how well simple predictors match observed order for each sampled validator/version. A counterexample to global fee-sorted block order is not a counterexample to a queue that prioritizes the transactions available at a particular instant.

Recorded attempts: 288. Successful on-target observations: 280. Distinct on-target identities: 6. Distinct exact version strings: 3. Distinct advertised clientIds: 5.

## Per-validator price sweep

Within each window, score concordant same-block pairs / all informative same-block pairs, then average windows equally. Higher CU price is the candidate prediction. A score of 1 means all compared pairs in the observed sample agree; it does not prove the rule. A score near 0.5 is not proof of randomness. This dataset contains 2 observed repeat identifiers. Confidence intervals are withheld below five informative windows; shown intervals are exploratory and marginal, without multiplicity correction.

| Validator | Version | Advertised clientId | Locks | Informative windows | Mean price concordance | Exploratory 95% interval |
|---|---|---|---|---:|---:|---|
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 4.3.2 | HarmonicAgave | shared-payer | 2 | 0.833 | insufficient windows |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 26.10.5 | FireBAM | shared-payer | 2 | 0.750 | insufficient windows |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 26.10.4 | HarmonicFiredancer | shared-payer | 2 | 1.000 | insufficient windows |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 26.10.4 | Firedancer | shared-payer | 2 | 1.000 | insufficient windows |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 4.3.2 | JitoLabs | shared-payer | 1 | 0.167 | insufficient windows |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 26.10.5 | Firedancer | shared-payer | 2 | 0.500 | insufficient windows |
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 4.3.2 | HarmonicAgave | independent-payers | 2 | 0.583 | insufficient windows |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 4.3.2 | JitoLabs | independent-payers | 2 | 0.750 | insufficient windows |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 26.10.4 | HarmonicFiredancer | independent-payers | 2 | 0.750 | insufficient windows |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 26.10.5 | FireBAM | independent-payers | 2 | 0.750 | insufficient windows |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 26.10.4 | Firedancer | independent-payers | 2 | 0.667 | insufficient windows |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 26.10.5 | Firedancer | independent-payers | 2 | 0.583 | insufficient windows |

## Verifiable price inversions

For each identity below, these two successful probes share a finalized block. The lower-priced probe serialized first. Signatures and indices can be checked directly with getBlock. This establishes only an observed inversion under our delivery path, not its cause.

| Validator | Slot | Earlier index / price | Later index / price | Earlier signature | Later signature |
|---|---:|---|---|---|---|
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | 462516458 | 43 / 0 | 45 / 1000 | 3YDBtUXiCtStck3nMGLeoN4mSMMA2uyurop9Gt8W97NpJArF8vkxEE3DeePfXsGzDBH9pfsPBvgz8uLMX9xaNgpt | 2MFFDLuvfJe8x4345bPqFA7sV9maJiDRpNCnJ6TBNQAugujkQpZsQqLwcsVYogjdLrYH2swcDpiSQwnjcyAc9Mau |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | 462516225 | 251 / 1000 | 282 / 10000 | 4cNyhs6NxQyMC7JnkSG6ZS37EaXQiiC4MUjiUCrmfaMgCELPyjZhjZypD9Kyg422BQ4NF2nJWGjSN7VMBRBHBC8U | 2K2mfaDJNqNCbz2vqsmmac9Kwq1eoinUcdRjupKAyNEHoBRYWay39xA9QB9Myhpi7F9qwsDSFjssdFVezbxaifDX |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | 462517174 | 18 / 1000 | 76 / 10000 | 3sgtvY2ZMf1bbPqDWTbQqPNDRLxB2rCacARcPWSswarddESXwn8aFVEpbntxGgaH8F5z6wod5RxF6sGYjZNenBcz | 3hwAp2E34HbioRh9XELND4tKrDtusqKuv98y9obEZHsb2upSXSS12u8D9kNmuBVHmL8ZPmwRSymimPLnN8YLceCL |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | 462518817 | 331 / 0 | 416 / 1000 | 4w68jAVTQodcTjt9hbpt6k5LWeBPB6sHp9ByRbD8xzjB66yUPfEEpojSf3vUyRiLsQjTXXJ86sCwh13faAgN5yYM | R8PwSv9npbhEfgd31gneC1tBejCfuxWCZgocTkEAoNwsjZwqiZkBVM9joxxBM2RLDtogWjtpQYHnZk9zF1wLZF8 |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | 462516306 | 165 / 1000 | 184 / 100000 | 3smJE7LcCHiPy1HAhao7veuDMWea1hdhyCWH88Dj96nqL6CKQ4vuTNBRs7yJSjp5icaAvKJCmZBUBpe4Dk6ujERM | 5atNFwjcv8ffv8LZ7Tfqw4WePNcsr7RgiBkRE36PDUmyZvnpFt26sPxJCFu8KrkyFzJRD7mzsvZY8nRZFpCPmp7v |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | 462516377 | 308 / 1000 | 355 / 10000 | 3dzU1bsyrXypgfMTKZXBQzjdYkjiXYP1ptReJUPaa9nT5BGDu8zwK2n6iKDPBcmWZeg2HHtj6tLqW69UCQ9Hc4bh | 4TpPNRy6xFH7AvjdTeZqr17VGtnVQxMM1PpGr6nw3YPKEDHGp1x2cYXNS9qGPVbSSUR4J1iTA6PvibGrrryqXA6y |

## Interpretation of the other treatments

The fixed-price limit sweep changes both requested CU and total priority fee. The equal-priority-fee sweep holds the total at 100 lamports while inversely changing CU price and CU limit; those two factors remain collinear and cannot be independently identified from that sweep. See [window-statistics.json](results/analysis/window-statistics.json) for all four candidate predictors by lock mode and treatment. Independent payers remove the shared writable fee payer, but also introduce payer-specific balance/path differences. Payer assignments rotate across repeats.

## Other candidate predictors

Each cell is mean window concordance followed by the number of informative windows. Lower requested CU is the candidate prediction in the two resource sweeps; earlier local dispatch is compared only in the fixed-resource price sweep. These are descriptive comparisons, not isolated causal effects.

| Validator prefix | Locks | Lower CU at fixed price | Lower CU at equal priority fee | Earlier dispatch in price sweep |
|---|---|---|---|---|
| Fd7btgyS… | shared-payer | 1.000 (n=2) | 1.000 (n=1) | 0.500 (n=2) |
| 9jxgosAf… | shared-payer | 0.917 (n=2) | 0.667 (n=2) | 0.833 (n=2) |
| JUPiTERr… | shared-payer | 0.750 (n=2) | 0.750 (n=2) | 0.583 (n=2) |
| 9eGrDohd… | shared-payer | 0.333 (n=2) | 0.417 (n=2) | 0.667 (n=2) |
| HEL1USMZ… | shared-payer | 0.250 (n=2) | 0.333 (n=2) | 0.500 (n=1) |
| DNVZMSqe… | shared-payer | 0.083 (n=2) | 0.333 (n=2) | 0.500 (n=2) |
| Fd7btgyS… | independent-payers | 0.583 (n=2) | 0.500 (n=2) | 0.333 (n=2) |
| HEL1USMZ… | independent-payers | 0.667 (n=2) | 0.333 (n=2) | 0.500 (n=2) |
| JUPiTERr… | independent-payers | 0.667 (n=2) | 0.917 (n=2) | 0.417 (n=2) |
| 9jxgosAf… | independent-payers | 0.583 (n=2) | 0.500 (n=2) | 0.500 (n=2) |
| 9eGrDohd… | independent-payers | 1.000 (n=2) | 0.750 (n=2) | 0.583 (n=2) |
| DNVZMSqe… | independent-payers | 0.833 (n=2) | 0.667 (n=2) | 0.667 (n=2) |

## What went wrong

The v1 pilot used long memos and sequential sends. It recorded eight successful on-target transactions before a low-CU simulation failed. That simulation prevented further submissions. The primary v2 campaign uses fixed-size short memos and burst dispatch, after all ten unique probe budgets passed funded simulation. Pilot data is exported separately and never pooled into the primary analysis.

Finalized off-target observations: 8. Failed on-chain observations: 0. Unresolved attempts: 0.

Collection encountered one HTTP 502 from getSignatureStatuses; reading was repeated successfully. No submission was repeated because of that error. Later collector code records transient HTTP errors and retries read-only requests at most twice, while sendTransaction remains single-attempt.

Some bursts straddled blocks or landed on another leader despite targeting a leader window. Such cases remain in raw data. Only same-block, successful on-target pairs contribute to ordering scores; this conditioning may bias the sample. Missing cells or partial batches are visible in [report.md](results/analysis/report.md) and must not be interpreted as negative evidence.

## Reproduction and evidence

Run npm ci, npm test, then the documented reproduce command against every exported main run. Exported integrity.json records SHA-256 hashes. Each observation points to a saved full block and signature index. RPC logs, attempts, window events and configuration manifests preserve the measurement provenance. The spend reservation journal covers pilot and all main runs; raw finalized fees and reserved fees are different accounting quantities.

## Source context and limits

Agave v4.3.2 computes priority from bank reward divided by cost, with integer scaling; a CU-price-only model is incomplete outside a fixed-resource sweep. See [the source review](docs/SOURCE-REVIEW.md) for source links and lock/thread constraints. Where available, advertised clientId is joined from the last successful getClusterNodes snapshot at or before each dispatch; each derived row identifies the raw record and its hash. See [client attribution](docs/CLIENT-ATTRIBUTION.md) for the monitor cross-check and freshness limits. Numeric versions alone do not identify a fork, and advertised IDs do not attest the remote binary or active scheduling mode.

Measurement dates (UTC): 2026-10-28. The intended campaign is entirely after the October 21, 2026 upgrade; check the raw slots and timestamps. Transport path, provider forwarding, packet timing at the leader and internal worker scheduling remain unobserved. The baseline used grouped treatments; expanded-v3 interleaves all six conditions in seeded per-validator rounds. The phases remain separate. Time-varying load, route and operator configuration remain possible confounders. No global causal scheduler rule or claim of random ordering is established. Larger repeated, interleaved measurements and a second delivery path are the most valuable next experiment.
