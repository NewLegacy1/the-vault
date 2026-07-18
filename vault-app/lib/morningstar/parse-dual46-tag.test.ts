import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseDual46Tag } from "./parse-dual46-tag";

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
