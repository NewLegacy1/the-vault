---
topic: tpo-market-profile-basics
researched: 2026-07-21
sources: 5
agent-cycle: adhoc-auction-2026-07-21
---
# TPO / Market Profile basics (Steidlmayer)

## Key findings

- **CLAIM:** Market Profile (J. Peter Steidlmayer / CBOT) organizes the session as an auction of **time at price**, not as a candlestick narrative. **EVIDENCE:** CME/CBOT Market Profile literature and Sierra Chart’s TPO documentation define the same building blocks (letters, POC, VA). Teaching framework — not a Vault backtest.
- **CLAIM:** A **TPO** (Time Price Opportunity) is one letter (or block) printed at each price the market traded during a fixed time bracket — usually **30 minutes**. **EVIDENCE:** Sierra Chart default: profile period = 1 day, letter period = 30 minutes (user-configurable).
- **CLAIM:** **POC** (Point of Control) = price with the most TPOs (longest letter row) — where the market spent the most *time*. **EVIDENCE:** Sierra Chart TPO study calculation docs; standard MP texts.
- **CLAIM:** **Value Area (VA)** ≈ the contiguous price band around POC that captures ~**70%** of session TPOs; **VAH** / **VAL** = high / low of that band. **EVIDENCE:** Industry default 70% in Sierra Chart and MP training materials; % is a parameter, not a law of nature.
- **CLAIM:** **Initial Balance (IB)** = range of the first two TPO periods (commonly first **60 minutes** of RTH when letters are 30m). Day-type intuition (balance / rotation vs trend / range extension) is built from IB vs later profile shape. **EVIDENCE:** Classic MP day-type taxonomy (normal, normal variation, trend, neutral, etc.) — **practitioner CLAIM**, not Vault-measured.
- **Sierra Chart naming:** the study is **“TPO Profile Chart”**, not “Market Profile.” Docs explicitly: TPO charts are also known as Market Profile charts; in Sierra Chart they are called TPO Charts. Pair with **Volume by Price (VBP)** as a separate study.

## Details / mechanics

**Letters.** Each 30m bracket gets the next letter (A, B, C…). A price that trades in three brackets shows three letters in that row. Single prints (one letter, no overlap) mark thin acceptance — often revisited later (CLAIM from MP teaching).

**POC / VA.** Build the histogram of TPO counts by price → longest row = POC → expand up/down until ~70% of TPOs are enclosed → VAH/VAL. Developing POC/VA update through the session; prior-day VAH/VAL/POC are the usual overnight reference levels.

**IB.** First two letters’ high–low. Wide IB + failed range extension → balance day intuition; narrow IB + persistent one-sided extension → trend-day intuition. **Do not treat day-type labels as Dual46 filters** until logged and scored.

**Platform note.** TradingView’s “Volume Profile” / Fixed Range tools are **volume**, not TPO letters. True TPO letter profiles need Sierra (or equivalent MP software). Eyes-only TPO context for Dual46 therefore implies Sierra (or accepting volume-profile proxies — see companion note).

## APPLICATION TO THE VAULT

- **Eyes-only context for the Dual46 10:00 leave** — optional glance: session **open vs prior-day VA** (inside value / above VAH / below VAL); **IB width vs OR30** as a second balance/expansion cue. Does **not** arm, veto, or size Dual46.
- **NEVER** a Dual46 lock edit mid-May walk. Profile levels are journal/context only; no Pine change, no freeze retune, no Lab promote from profile shape.
- If logging: one boolean or enum (`open_vs_prior_VA`: inside / above / below) is enough for post-May splits — do not invent TPO day-type filters into Stage-0 without a measurable definition and event-study path.
- Cross-link: volume POC preferred for participation reads → [[volume-profile-poc-vah-val]]; absorption census → [[order-flow-absorption]]; hub → [[../hubs/hub-auction]].

## Sources

1. Sierra Chart — TPO (Time Price Opportunity) Profile Charts — https://www.sierrachart.com/index.php?page=doc%2FStudiesReference%2FTimePriceOpportunityCharts.html
2. Sierra Chart Support — TPO Profile Chart study (defaults: 1-day profile, 30m letters) — https://www.sierrachart.com/SupportBoard.php?ThreadID=249
3. Axia Futures — How To Setup Sierra Chart Market Profiles (study name = TPO Profile; VBP separate) — https://axiafutures.com/blog/how-to-sierra-chart-market-profile/
4. marketprofile.info — Sierra Chart Market Profile setup / 30m & 70% VA conventions — https://marketprofile.info/articles/sierra-chart-setup-guide
5. Steidlmayer / CBOT Market Profile tradition (public summaries; original CBOT materials) — treat taxonomy as CLAIM, not Vault evidence
