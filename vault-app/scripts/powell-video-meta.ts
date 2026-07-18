import { readFileSync } from "fs";

const html = readFileSync("powell-videos.html", "utf8");
const ids = [
  "PFi9qYFkjCg", "CZguhuUIx98", "IIcCoub6XRI", "tNyT7tHOmGI", "WEeXKMzaJjY",
  "FGx_Cn5soq4", "3KgvdWAmyaE", "KYHeD1famlY", "4COROwkO3DI", "Y-oqSZmNo4U",
  "9jEvZAPXPVs", "ikIcAFTkVPQ", "AGmRZ9Te9NY", "a3LzCUZU5ko",
];
for (const id of ids) {
  const i = html.indexOf(`"contentId":"${id}"`);
  if (i < 0) {
    console.log(id, "| not found");
    continue;
  }
  const seg = html.slice(i, i + 8000);
  const dur = seg.match(/(\d+ (?:minutes?|seconds?)(?:, \d+ seconds?)?)/);
  const views = seg.match(/([\d.,]+[KM]? views)/);
  console.log(`${id} | ${dur ? dur[1] : "?"} | ${views ? views[1] : "?"}`);
}
