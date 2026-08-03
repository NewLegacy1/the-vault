import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseDual46Tag, parseJournalCard, ymdToDateStr } from "./parse-dual46-tag";

describe("parseDual46Tag", () => {
  it("parses clean Cont OTE+KO WIN", () => {
    const p = parseDual46Tag("LONG · Powell · Cont · 1RB · OTE+KO · 1:5 WIN");
    assert.equal(p.confidence, "high");
    assert.equal(p.direction, "long");
    assert.equal(p.pathBModel, "Cont");
    assert.equal(p.pathBGrade, "OTE+KO");
    assert.equal(p.planRr, 5);
    assert.equal(p.dualOutcome, "WIN");
  });

  it("parses Judas SHADOW LOSS with OCR junk", () => {
    const p = parseDual46Tag("SHORT - Powell - Judas - 1RB - OTE - 1:3 SHADOW LOSS");
    assert.equal(p.direction, "short");
    assert.equal(p.pathBModel, "Judas");
    assert.equal(p.pathBGrade, "OTE");
    assert.equal(p.planRr, 3);
    assert.equal(p.dualOutcome, "LOSS");
    assert.equal(p.shadow, true);
  });

  it("picks stop pts from -19.8 pt", () => {
    const p = parseDual46Tag("LONG · Powell · Cont · 1RB · OTE · 1:5 WIN\n-19.8 pt\n+98.4 pt");
    assert.equal(p.stopPts, 19.8);
    assert.equal(p.tpPts, 98.4);
  });
});

describe("parseJournalCard", () => {
  const sample = `MS JRN
D=20260718 T=1008
SIDE=SHORT
TAG=Powell Cont 1RB OTE+KO
STOP=12.5 PLANR=5.0
ATR1=8.2 XATR=1.5 DATR=110.0
OR30=0.91 BAND=0.75-1.25
VIX=17.4 BAND=16-20
5M=Y MFER=3.8
OUT=LOSS FILL=yes`;

  it("parses full MS JRN card", () => {
    const p = parseJournalCard(sample);
    assert.equal(p.confidence, "high");
    assert.equal(p.entryYmd, 20260718);
    assert.equal(p.entryHhmm, "1008");
    assert.equal(p.direction, "short");
    assert.equal(p.sleeve, "powell");
    assert.equal(p.pathBModel, "Cont");
    assert.equal(p.pathBGrade, "OTE+KO");
    assert.equal(p.stopPts, 12.5);
    assert.equal(p.planRr, 5);
    assert.equal(p.atrPts, 8.2);
    assert.equal(p.xAtr, 1.5);
    assert.equal(p.dailyAtrPts, 110);
    assert.equal(p.or30ratio, 0.91);
    assert.equal(p.vixPrevClose, 17.4);
    assert.equal(p.fiveMinConfirm, true);
    assert.equal(p.mfeR, 3.8);
    assert.equal(p.dualOutcome, "LOSS");
    assert.equal(p.fillStatus, "yes");
  });

  it("parseDual46Tag routes MS JRN through card parser", () => {
    const p = parseDual46Tag(sample);
    assert.equal(p.vixPrevClose, 17.4);
    assert.equal(p.pathBGrade, "OTE+KO");
  });

  it("ymdToDateStr formats journal date", () => {
    assert.equal(ymdToDateStr(20260718), "2026-07-18");
  });

  it("handles leave sleeve + 5M=N", () => {
    const p = parseJournalCard(`MS JRN
D=20260618 T=1012
SIDE=LONG
TAG=leave 5RB
STOP=9.0 PLANR=8.0
ATR1=6.0 XATR=1.5 DATR=95
OR30=1.4 BAND=gt1.25
VIX=22.1 BAND=gt20
5M=N MFER=0.2
OUT=WIN FILL=yes`);
    assert.equal(p.sleeve, "leave");
    assert.equal(p.fiveMinConfirm, false);
    assert.equal(p.dualOutcome, "WIN");
    assert.equal(p.vixPrevClose, 22.1);
  });
});
