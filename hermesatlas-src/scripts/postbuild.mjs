// Post-build: strip `crossorigin` attribute from script/link tags
// to avoid CORS issues on some mobile browsers.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const indexPath = path.join(distDir, "index.html");

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");
  html = html.replace(/\s+crossorigin(?:\s|>|="")/g, " ");
  fs.writeFileSync(indexPath, html);
  console.log("✓ Stripped crossorigin from index.html");
}
