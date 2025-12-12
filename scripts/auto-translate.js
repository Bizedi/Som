import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import matter from "gray-matter";

const blogDir = path.resolve("src/content/blog");

const listMd = () =>
  readdirSync(blogDir).filter((f) => f.endsWith(".md"));

const baseSlug = (fname) =>
  fname.replace(/\.md$/, "").replace(/-so$/, "").replace(/-en$/, "");

const translate = async (text, from, to) => {
  if (!text.trim()) return "";
  const safe = text.replace(/[\uD800-\uDFFF]/g, "");
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    from +
    "&tl=" +
    to +
    "&dt=t&q=" +
    encodeURIComponent(safe);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate failed ${res.status}`);
  const j = await res.json();
  return j[0].map((a) => a[0]).join("");
};

const translateMd = async (content, from, to) => {
  const maxChunk = 1200;
  const parts = content.split(/\n{2,}/);
  const out = [];
  for (const p of parts) {
    let chunk = p.trim();
    while (chunk.length > maxChunk) {
      const slice = chunk.slice(0, maxChunk);
      out.push(await translate(slice, from, to));
      chunk = chunk.slice(maxChunk);
    }
    if (chunk) out.push(await translate(chunk, from, to));
    out.push(""); // preserve paragraph spacing
  }
  return out.join("\n").trim();
};

const parseFrontMatter = (raw) => {
  try {
    const parsed = matter(raw);
    return { fm: parsed.data, body: parsed.content };
  } catch {
    return null;
  }
};

const main = async () => {
  const files = listMd();
  const groups = new Map();
  for (const f of files) {
    const slug = baseSlug(f);
    const arr = groups.get(slug) || [];
    arr.push(f);
    groups.set(slug, arr);
  }

  for (const [slug, flist] of groups.entries()) {
    const hasEn = flist.some(
      (f) => f.endsWith("-en.md") || (!f.endsWith("-so.md") && !f.includes("-so"))
    );
    const hasSo = flist.some((f) => f.endsWith("-so.md"));
    if (hasEn && hasSo) continue;

    const missing = hasEn ? "so" : "en";
    const sourceFile = hasEn
      ? flist.find((f) => !f.endsWith("-so.md"))
      : flist.find((f) => f.endsWith("-so.md"));
    if (!sourceFile) {
      console.warn("Skipping missing source for", slug);
      continue;
    }
    const raw = readFileSync(path.join(blogDir, sourceFile), "utf8");
    const parsed = parseFrontMatter(raw);
    if (!parsed) {
      console.warn("Skipping invalid frontmatter", sourceFile);
      continue;
    }
    const { fm, body } = parsed;
    const from = missing === "so" ? "en" : "so";
    const to = missing === "so" ? "so" : "en";

    console.log(`Translating ${slug} -> ${to}`);
    const newTitle = await translate(fm.title || slug, from, to);
    const newExcerpt = fm.excerpt ? await translate(fm.excerpt, from, to) : "";
    const newBody = await translateMd(body.trim(), from, to);

    const newFm = {
      ...fm,
      title: newTitle,
      language: to,
      excerpt: newExcerpt,
    };
    const fmText = Object.entries(newFm)
      .map(([k, v]) => `${k}: ${JSON.stringify(String(v))}`)
      .join("\n");
    const newName = `${slug}-${to}.md`;
    writeFileSync(
      path.join(blogDir, newName),
      `---\n${fmText}\n---\n\n${newBody}\n`,
      "utf8"
    );
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

