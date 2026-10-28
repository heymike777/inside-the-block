# Validator client attribution

The baseline originally reported only numeric versions. That was incomplete: the saved `getClusterNodes` responses already contain `clientId`. We now reconstruct attribution from the final successful gossip snapshot **at or before each dispatch**, keeping the original observations and raw logs unchanged.

## What the evidence establishes

`clientId` is an advertised software identifier. The [Agave v4.3.2 registry](https://github.com/anza-xyz/agave/blob/v4.3.2/version/src/client_ids.rs) defines these strings, and the [release changelog](https://github.com/anza-xyz/agave/blob/v4.3.2/CHANGELOG.md) documents their RPC exposure. This is direct metadata evidence rather than an inference from numeric versions. It is not remote binary attestation, a build commit hash, or proof of a particular active scheduler configuration.

The separate [Firedancer daily report](https://reports.firedancer.io/?tab=validators&period=daily&date=2026-10-27) corroborates the identity-level classifications below. Its latest available report at retrieval was **2026-10-27**; requesting October 28 returned “No data available.” It is dated corroboration, not a contemporaneous independent binary measurement.

| Identity | Operator name in monitor | Gossip clientId | Gossip version | Monitor client, Oct 27 | Monitor version |
|---|---|---|---|---|---|
| Fd7btgySsrjuo25CJCj7oE7VPMyezDhnx7pZkj2v69Nk | Figment | HarmonicAgave | 4.3.2 | Agave Harmonic | 4.3.2 |
| HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU | Helius | JitoLabs | 4.3.2 | Agave Jito | 4.3.2 |
| JUPiTERrZqgf1jUyR7dSkhMx4Kn2qJyekWsg3LT1h4b | Jupiter | HarmonicFiredancer | 26.10.4 | Firedancer Harmonic | 26.10.4 |
| 9eGrDohdNTAo61DRHyfMuqKWXqYnA3i254Wiszxe8FoY | Galaxy | Firedancer | 26.10.4 | Firedancer Jito | 26.10.4 |
| 9jxgosAfHgHzwnxsHw4RAZYaLVokMbnYtmiZBreynGFP | not supplied | FireBAM | 26.10.5 | Firedancer JitoBAM | **26.10.4** |
| DNVZMSqeRH18Xa4MCTrb1MndNf3Npg4MEwqswo23eWkf | Firedancer Development | Firedancer | 26.10.5 | Firedancer Jito | 26.10.5 |

The FireBAM version discrepancy is retained, not silently corrected. The measurement-time gossip takes precedence for the version; the older monitor supports the variant label only. Generic `Firedancer` IDs do not alone establish Jito integration; that additional label comes from the dated monitor.

## Fork versus active scheduling mode

The registry distinguishes HarmonicAgave, HarmonicFiredancer, JitoLabs, Firedancer and FireBAM: **five advertised variants across two underlying implementation families**. We do not call this five independent base clients. Harmonic publishes [Salsa](https://github.com/harmonic/salsa) and [Samba](https://github.com/harmonic/samba). [Harmonic's architecture](https://harmonic.gg/) describes configurable builders and fallback paths; an advertised Harmonic client is not proof that a particular sampled block used a specific remote builder or strategy.

[Official BAM documentation](https://bam.dev/validators/) identifies FireBAM as a Firedancer fork and documents runtime enable/disable controls. Consequently a FireBAM advertisement is not proof of active BAM delegation or FIFO arrival order for our probes. Jito tips and bundles remain absent from our own experiment.

## Reproduce the temporal join

Run `node src/cli.mjs reproduce-all results`. Each derived attributed row records the exact raw `rpc.jsonl` line number, snapshot timestamp, snapshot age and SHA-256 of that UTF-8 record without the trailing newline. Off-target observations retain `targetClientId` but have no assigned actual `clientId` from the intended leader. No later snapshot can label an earlier transaction.

The derived files live in `results/attribution/`; source snapshots and their hashes are documented in `validator-clients.json`. The monitor API is public and requires no credential. The validators.app pages returned no usable client content during this check, so they are not counted as positive evidence. Future runs check clientId changes before sending, and analysis separates client IDs even when numeric versions match.
