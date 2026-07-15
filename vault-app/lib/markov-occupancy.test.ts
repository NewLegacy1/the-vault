import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildMarkovOccupancy, tagJulOctRegime } from "./markov-occupancy";
import { filterByContextSlice } from "./context-slice";

describe("markov-occupancy", () => {
  it("builds non-overlapping windows with π summing ~1", () => {
    const dates = [
      "2024-06-03",
      "2024-06-10",
      "2024-07-01",
      "2024-07-08",
      "2024-08-05",
      "2024-10-07",
      "2024-11-04",
    ];
    const r = buildMarkovOccupancy({
      dates,
      tagDay: tagJulOctRegime,
      windowDays: 7,
    });
    assert.ok(r.nWindows > 0);
    const sum = Object.values(r.pi).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 0.02 || r.nWindows === 0);
    assert.ok(r.labels.includes("TRADE") || r.labels.includes("STAND_DOWN"));
  });
});

describe("context-slice", () => {
  it("filters Jul+Oct", () => {
    const trades = [100, -50, 200, -40];
    const dates = ["2024-06-01", "2024-07-01", "2024-08-01", "2024-10-01"];
    const sliced = filterByContextSlice(trades, dates, "jul_oct");
    assert.equal(sliced.trades.length, 2);
    assert.deepEqual(sliced.dates, ["2024-07-01", "2024-10-01"]);
  });
});
