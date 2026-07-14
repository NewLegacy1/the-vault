# Combined / hybrid cohorts

> Hybrid H-series now saves by **phase**: Eval → `../eval/`, Funded → `../funded/` (not this folder).  
> Keep this folder for ad-hoc `phase: combined` blends only.

| Branch | Phase | Preset | Pine profile | Ledger shortcut |
|---|---|---|---|---|
| **H0a** | **eval** | `matrix-h0a` | Hybrid_Sleeve_v0 · H0a | `matrix/hybrid-h0a.csv` |
| **H0b** | **funded** | `matrix-h0b` | Hybrid_Sleeve_v0 · H0b | `matrix/hybrid-h0b.csv` |
| **H1a** | **eval** | `matrix-h1a` | Hybrid_Sleeve_v0 · H1a | `matrix/hybrid-h1a.csv` |
| **H1b** | **funded** | `matrix-h1b` | Hybrid_Sleeve_v0 · H1b | `matrix/hybrid-h1b.csv` |

Pine: `pine/Hybrid_Sleeve_v0.pine`  
Rebuild shortcuts: `npx tsx scripts/build-hybrid-matrix.ts` from `vault-app/`.  
See [[strategy-dev/hybrid-playbook]].
