---
topic: powell-risk-trade-management
researched: 2026-07-17
sources: 14
agent-cycle: wave-2
---

# Powell — risk & trade management teachings

All quotes are verbatim (auto-caption) extracts from local transcripts in `vault-app/data/powell-transcripts/`; timestamps as [m:ss]. This cycle fetched the 5 previously untranscribed videos (`fetch-powell-wave2.ts`), so **all 14 long-form videos** now have full transcripts — no claim below rests on secondary summaries.

## Key findings

- **His master sizing rule: the trailing buffer IS the account.** "If you have a 50K funded account with a $2,000 drawdown, just treat it as a $2,000 live account because that's essentially the purchasing power that you have." (*Blowing all of my accounts*, [4:04–4:15]). Same rule at stack level: "this is a draw down of 2,500 × 20. What do I do? I treat this as a $50,000 live account… I copy trade them all in one big group." (*Break The Cycle*, [9:29–9:51]). The Socratic version: "if I were to tell you to open a live account with $10,000… would you fullport it right away with max contracts? No." ([8:36–8:53]).
- **Daily circuit breaker is his single most-repeated risk rule.** "If I take a win on the day, completely shut my laptop. No questions asked. If I take a loss, I can derisk 50%, go back in the market, take one more trade, one more high quality trade… If that loses, close the laptop. If that wins, close the laptop." (*5 trading mistakes that kept me unprofitable*, [23:56–24:21]). Variant with one more attempt: "take max two losses a day, two to three trades per day, and stop… If you take three trades and they're all losers… you're offside. Just stop trading for the day." (*60k in February*, [10:27–10:47]).
- **De-risking is dynamic, not fixed-size.** Besides the 50%-after-a-loss rule, he halves size when structure forces a wide stop: "you would probably have to d-risk a little bit. Probably d-risk by half because the stop is almost 50 points, which [is] not my thing." (*Stop getting manipulated*, [10:43–10:49]). And post-max-payout he consciously flips aggressive: "after the max payout on the other 10, I blew them into oblivion. All right. And that's fine. That happens. After max payout, don't really care." (*60k in February*, [19:11–19:24]). Risk is a dial keyed to account state, never a constant.
- **RR floor, not RR target:** "I usually just tell everyone don't take anything lower than one to three… 1 to three and up is like pretty good for prop firms. One to three to one to six is like the sweet spot for me at least. Rarely take one to threes… my personal lowest is like 1 to four." (*Stop getting manipulated*, [15:54–16:14]). Self-reported stats: "average win 660, average loss 95… this is like closer to 60–65% [win rate] and then profit factor 5.88" (*High probability conditions*, [11:55–12:26]).
- **Why high RR is a *psychological risk device*, not just math:** "the whole bottom and top ticking thing was created because I could not take big losses. I physically could not take it. I had to lower my stop-loss size." (*5 mistakes*, [22:42–22:56]). "I could take three losses and it wouldn't even matter because my wins were like 10 times bigger." (*40,000 traders*, [12:38–12:44]). He explicitly tells low-RR-tolerant people the reverse: "For some of you, taking like the frequency of losses might be the problem and not the dollar amount… in that case, you should go for like a higher win rate and a lower RR." (*5 mistakes*, [21:57–22:07]).
- **Session/day filters function as hard risk rules:** "no news Mondays I don't trade those, any London session before CPI PPI NFP don't trade those, day before NFP sometimes don't trade that… if London or Asia expands like crazy… like 600 points, I'm not going to trade New York session. I'm just going to expect it to be accumulation because the move happened." (*High probability conditions*, [18:15–18:58]). Also "we have CPI tomorrow which makes today slightly lower probability" (*Stop getting manipulated*, [13:34]) and "I don't love trading lunch" (*Tick precision entries*, [22:56]).
- **Payout cadence is the objective function:** "We do it so that we can get to that payout page and get money into our bank account. We don't do this to sit and look at the unrealized P&L and take a screenshot." (*Break The Cycle*, [14:37–14:48]).
- **The one-month rule contract:** "stick to your rules for one singular month… I didn't even look at my P&L throughout the month… Follow the rules regardless. Like no deviations, nothing… end of the month, eligible for payouts on all of my accounts." (*5 mistakes*, [23:32–25:21]).
- **Preserve capital / scale only on proof:** "please go into this with the mentality that you are going to try to the best of your ability to preserve capital… Do not scale too quickly… Don't scale too soon. Start scaling when you have some proof in the pudding. All right? Do not go crazy and get 10 accounts right off the bat." (*Top 5 Mistakes*, [1:01–17:39]).

## Details / mechanics

**Position sizing**
- Funded-account sizing anchor = the trailing buffer treated as live equity (quotes above). He never states a %-of-buffer risk number on camera; his observed practice: 5–15-pt stops on NQ minis per account (e.g. "I have five points of risk. I don't really care. That's like $200" — *Live trade 1:7RR*, [1:39–1:43]; that's ~$200 risk against a $2,500 Apex buffer ≈ 8%). ⚠ Inference from his numbers, not a stated rule — and note it's aggressive relative to retail 1–2% doctrine; his justification is the account-as-cheap-option economics below.
- Beginner sizing: "if you're on a 50k and you got $2,000 worth of draw down, trade three micros, I would say, if you're a beginner, or five." (*Top 5 Mistakes*, [23:42–23:50]).
- After a loss: −50% size for the one allowed re-entry. Wide-structure days: −50% size. After max payout secured: size up freely, account is expendable.

**Stops** (mechanics detailed in `powell-rb-entry-teachings.md` §3; risk-relevant summary)
- Always a hard stop; typical 10–15 pts NQ, 5-pt when the level is A+, "27-pt" acceptable as safety variant, ~50-pt structural stops only with halved size. Historical note: "I used to do like two to 10 point stops… 10 point was like the absolute max. Now I don't really care. I want to be on side with the market." (*RB entry structure*, [6:03–6:13]).
- Volatility veto on tight stops: "10 to 15, even 20 point stops are not always the move… When we have volatile price action, these stop losses are going to get ran through pretty quick. This could go 15 points into drawdown and still be considered a top tick." (*High probability conditions*, [7:16–7:34]).
- Break-even/trailing: BE only after an objective event ("when price took out this high, I moved my stop loss to break even. Cuz at that point… it would just be chop" — *60k*, [18:33–18:48]); trails "to the most newly formed low" after structure breaks (*Live trade*, [0:13–0:16]); manual exit on SMT vs ES. He accepts BE wick-outs as a cost: "took me out break even to the tick and then went into my direction. It happens… price is going to be enticed to retry my level and then go into the [direction]." (*Break The Cycle*, [22:20–22:43]).
- Anti-pattern he names as his old account-killer: pulling the stop and exiting at break-even manually — "when price approached my stop loss I would just be like I'm going to take it off and I'm going to take it out at break even instead… it never did go back to break even." (*40,000 traders*, [3:52–4:05]).

**Daily / weekly limits**
- 2–3 trades/day max, 2 losses max, win = done for the day; ~3 trades/week overall ("I might take like three trades per week and they are just high quality trades" — *Tick precision*, [17:04–17:08]).
- Condition-based quit: "you just see PD arrays getting disrespected, re-inversed, regained, all this stuff. That is kind of like a sign for me to close my laptop a lot of the time." (*High probability conditions*, [5:02–5:11]).
- Social blackout while trading: "just go ghost for like the two hours that you're actively trading and don't let anyone else influence your bias." (*40,000 traders*, [19:42–19:50]).

**Apex payout cadence (max-payout approach)**
- Economics: ~$19 eval (90%-off sale only — "If they're not 90% off or even 80% off, don't buy accounts") + $65–75 activation × 20 accounts ≈ $840–1,800 total; copy-trade as one unit. 50k first payout requires $4,000 profit; "after that, you only have to make two [thousand]… I made 1,200 per account. I now only need 800 more for another max payout." (*60k*, [20:52–21:07]). Claimed cadence: "I can do this twice with Apex per month. So $80,000 with Apex per month." (*Break The Cycle*, [7:53–7:58]) — ⚠ self-reported, payout screenshots shown on camera but not independently verifiable.
- Cycle: pass cheap evals in bulk → trade the stack conservatively to first max payout → then aggressive/expendable → blow or retire accounts → rebuy. Ran the same 20 accounts ~4–5 months of repeated payouts (*Blowing all of my accounts*, [2:30–2:47]; *Top 5 Mistakes*, [22:38–22:57]).
- Rule-set arbitrage: he deliberately blew old-rule accounts to move to Apex's newer accounts ("50% consistency rule instead of 30… no MAE… No payout denials" — *Blowing all of my accounts*, [1:16–2:07]). MAE mechanics from *Different Version of You* [0:44–1:21]: losing 30% of buffer unrealized reset his payout cycle and raised the $50 winning-day requirement to $150 — prop-firm rule risk is a first-class risk in his system.
- Prop-firm framing: account fee = option premium. "You can spend $2,000 and you can make hundreds of thousands of dollars" (*Top 5 Mistakes*, [23:07–23:11]); "You would have to blow so many accounts for it to not be worth it." (*Break The Cycle*, [5:47–5:50]).

**Psychology rules that function as risk rules**
- One-month rule adherence with P&L blindness (quote above) — process metric, not outcome metric.
- Emotion-to-rule mapping: "The consistency rule — your greed doesn't like the consistency rule. The max drawdown — your fear doesn't like the max drawdown. The minimum trading days — your impatience doesn't like the minimum trading days." (*Break The Cycle*, [10:43–11:06]).
- Anti-tilt: the two-loss urge to double contracts is named and banned ("the urge to put on twice the amount of contracts is kind of lurking in the back of my mind. Now, this is going to [ruin] you in the long term." — *Break The Cycle*, [15:38–15:53]).
- Downsizing as the blowup cure: "If you keep ending up in this loop of blowing and buying… please stop. Downsize. Use smaller risk. Get more confident in your setups. Take less trades." (*Break The Cycle*, [21:17–21:23]).
- Income buffer before going full-time: quit with ~$10k buffer and calls it "a little bit too early… Don't burn the boats too soon because when you actually have to rely on trading… you start worrying more about the individual trades." (*5 mistakes*, [2:04–2:48]).
- Addiction self-audit as gambling-risk screen (*40,000 traders*, [5:06–8:07]): addiction-prone brain ⇒ tighter anti-overtrading guardrails.

## APPLICATION TO THE VAULT

Measured against the frozen Dual46 study convention (limit at 1m RB wick · stop beyond RB extreme + buffer · fixed 1:5 capped 100 pts · fixed 10 MNQ) and this wave's sizing finding (10 MNQ on a 33.5-pt stop ≈ 27% of a $2.5k Apex-style trailing buffer):

| Element | Dual46 / Vault | Powell | Verdict |
|---|---|---|---|
| Risk unit | Fixed 10 MNQ (study convention); live sizing flagged → fixed-dollar risk | "Treat the $2,500 buffer as a $2,500 live account"; would never full-port max contracts | ✅ **Direct agreement with the fixed-dollar-risk finding.** His own rule condemns fixed 10 MNQ for live: no one puts 27% of a live account on one trade. Keep 10 MNQ for study comparability only. |
| Risk % per trade | Wave-2 finding implies ~1–5% of buffer for live | Observed ~8% of buffer (5-pt stop, 2 minis); never states a % rule | ⚠ He is *more* aggressive than the Vault's conservative target — but his backstop is account expendability ($19 evals, 20-account stack), which the Vault does not assume. Do not import his risk level; import his risk *unit* (the buffer). |
| RR geometry | Fixed 1:5 capped 100 pts | Floor 1:3, sweet spot 1:3–1:6, personal min 1:4, realized avg ~1:7 | ✅ 1:5 sits inside his band. His refusal of sub-1:3 matches the cap logic. |
| Stop | Beyond RB extreme + buffer, no BE moves in study | Same baseline, but BE after internal high taken + structural trailing + SMT exit | ⚠ Known divergence (see RB note §3–4). His BE-wick acceptance quote confirms BE moves cost re-entries — a Stage-0 question, not a lock change. |
| Daily limits | Journal-enforced walk cadence | Hard: win = done; loss = 1 more at 50% size; max 2 losses; 2–3 trades/day; ~3/week | ✅ Compatible. The **50%-derisk-after-loss** rule is his only *sizing* rule inside a day — it is dynamic sizing, which the frozen study convention deliberately excludes. If ever tested, it's a path-MC experiment (it changes E[$/wk] variance, not trade EV). |
| Session filters | 10:00 KO retest window | Skip: no-news Mondays, London pre-CPI/PPI/NFP, sometimes day-before-NFP, NY after 600-pt overnight expansion, lunch | ⚠ Mechanizable day-filter candidates for a future Stage-0 (they filter *days*, so they compound with, not alter, the frozen entry). Note kill-lessons first: day-of-week/condition filters have historically been where Track B overfits. |
| Payout cadence | Prop math hierarchy: path MC E[$/wk] first | Max-payout extraction: conservative to first max payout, then aggressive/expendable; 2 cycles/month claimed | ✅ Philosophically identical to the Vault's path-MC-first doctrine — he optimizes the *payout path*, not trade EV. His post-payout aggression is a regime switch the Vault's path MC could model explicitly (risk-of-ruin becomes irrelevant after extraction). |
| Prop rule risk | Trailing drawdown modeled | MAE reset cost him a full payout cycle; blew accounts to escape bad rule sets | ⚠ The Vault's path MC models drawdown but not consistency/MAE-style rule resets — worth a line item when modeling Apex specifically. |

Net: **Powell's most load-bearing risk teaching — size off the trailing buffer as if it were the whole account — independently confirms this wave's fixed-dollar-risk conclusion**, and his daily circuit breaker (win-and-walk / one derisked retry / hard stop at two losses) is the discipline layer the Dual46 journal already approximates. The genuine divergences are (a) his per-trade risk is larger than the Vault should run because his accounts are expendable options and the Vault's are not, and (b) his in-day dynamic sizing (50% derisk) and BE/trailing management are excluded by the frozen study convention — both are legitimate future Stage-0/path-MC questions, neither justifies touching the lock.

## Sources

Local transcripts (all in `vault-app/data/powell-transcripts/`, fetched 2026-07-17; wave-2 additions via `vault-app/scripts/fetch-powell-wave2.ts`):

1. `top-5-mistakes.txt` — Top 5 Mistakes Traders Make (PFi9qYFkjCg)
2. `5-mistakes-unprofitable.txt` — 5 trading mistakes that kept me unprofitable (ikIcAFTkVPQ)
3. `60k-february-setup.txt` — The setup that made me 60k in February (tNyT7tHOmGI)
4. `stop-getting-manipulated.txt` — Stop getting manipulated (WEeXKMzaJjY)
5. `high-probability-conditions.txt` — How to identify high probability trading conditions (3KgvdWAmyaE)
6. `live-trade-1-7rr.txt` — Powell strategy live trade execution 1:7RR (4COROwkO3DI)
7. `tick-precision-entries.txt` — How to find tick precision entries everyday (Y-oqSZmNo4U)
8. `rb-entry-structure.txt` — How to structure a Rejection block entry (AGmRZ9Te9NY)
9. `pd-array-6-figures.txt` — The PD-array that makes me 6 figures per month (a3LzCUZU5ko)
10. `blowing-all-accounts.txt` — Blowing all of my accounts. (CZguhuUIx98) *(new this cycle)*
11. `break-the-cycle.txt` — Break The Cycle (FGx_Cn5soq4) *(new this cycle)*
12. `different-version-of-you.txt` — There is a Different Version of You. (IIcCoub6XRI) *(new this cycle)*
13. `quit-my-job.txt` — I Quit My Job 2 Years Ago (KYHeD1famlY) *(new this cycle)*
14. `40000-traders-struggle.txt` — I asked 40,000 traders their BIGGEST struggle (9jEvZAPXPVs) *(new this cycle)*

No web sources used — transcripts were sufficient for every claim; ⚠ markers flag the two inferences (his implied %-of-buffer risk) and self-reported income claims.
