import { readFileSync } from "fs";

const html = readFileSync("powell-videos.html", "utf8");
const marker = "var ytInitialData = ";
const start = html.indexOf(marker);
if (start === -1) throw new Error("ytInitialData not found");
const jsonStart = start + marker.length;
const end = html.indexOf(";</script>", jsonStart);
const data = JSON.parse(html.slice(jsonStart, end));

const results: string[] = [];
function walk(node: unknown): void {
  if (Array.isArray(node)) {
    node.forEach(walk);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, any>;
    if (obj.videoRenderer || obj.richItemRenderer?.content?.videoRenderer) {
      const v = obj.videoRenderer ?? obj.richItemRenderer.content.videoRenderer;
      const title = v.title?.runs?.[0]?.text ?? "?";
      const len = v.lengthText?.simpleText ?? "?";
      const views = v.viewCountText?.simpleText ?? "?";
      const published = v.publishedTimeText?.simpleText ?? "?";
      results.push(`${v.videoId} | ${len} | ${views} | ${published} | ${title}`);
    }
    Object.values(obj).forEach(walk);
  }
}
walk(data);
console.log(results.join("\n"));
console.log("TOTAL", results.length);
