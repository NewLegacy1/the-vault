import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPlanRr, parsePlanRr } from "./parse-plan-rr";

describe("parsePlanRr", () => {
  it("accepts bare reward multiple", () => {
    assert.equal(parsePlanRr("5"), 5);
    assert.equal(parsePlanRr("3.8"), 3.8);
  });

  it("accepts 1:5 / 1-5 / 1 to 5 (not parseFloat truncation)", () => {
    assert.equal(parsePlanRr("1:5"), 5);
    assert.equal(parsePlanRr("1-5"), 5);
    assert.equal(parsePlanRr("1–5"), 5);
    assert.equal(parsePlanRr("1 to 5"), 5);
    assert.equal(parsePlanRr("1/5"), 5);
    assert.equal(parsePlanRr("1:3.8"), 3.8);
  });

  it("rejects empty / junk", () => {
    assert.equal(parsePlanRr(""), undefined);
    assert.equal(parsePlanRr("abc"), undefined);
  });

  it("formats display", () => {
    assert.equal(formatPlanRr(5), "1:5");
    assert.equal(formatPlanRr(undefined), "—");
  });
});
