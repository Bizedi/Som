import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const blogDir = path.resolve("src/content/blog");

const files = readdirSync(blogDir).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const full = path.join(blogDir, file);
  const raw = readFileSync(full, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    console.warn("No frontmatter", file);
    continue;
  }
  const [, fmBlock, content] = match;
  const fmLines = fmBlock.split("\n").filter(Boolean);
  const extraBody = [];
  const normalized = fmLines
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) {
        extraBody.push(line);
        return null;
      }
      const key = line.slice(0, idx).trim();
      const rawVal = line.slice(idx + 1).trim();
      const val = rawVal
        .replace(/\\+/g, "") // drop escape backslashes
        .replace(/^"+|"+$/g, ""); // trim surrounding quotes
      return `${key}: ${JSON.stringify(val)}`;
    })
    .filter(Boolean)
    .join("\n");
  const combinedBody =
    (extraBody.length ? extraBody.join("\n") + "\n\n" : "") + content.trim();
  const next = `---\n${normalized}\n---\n${combinedBody}\n`;
  writeFileSync(full, next, "utf8");
}

