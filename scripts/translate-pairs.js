import { readFileSync, writeFileSync } from "fs";
import path from "path";

const fetchFn = global.fetch;

const tasks = [
  {
    src: "src/content/blog/2025-10-13-hababka-ugu-fiican-ee-lagu-horumarin-karo-maskaxda-caruurta.md",
    from: "so",
    to: "en",
    out: "src/content/blog/2025-10-13-hababka-ugu-fiican-ee-lagu-horumarin-karo-maskaxda-caruurta-en.md",
  },
  {
    src: "src/content/blog/2025-11-03-wargelin-muhiim-ah-miftah-som-wuxuu-idiin-hayaa-waxbarashada-quraanka-kariimka-ah-far-barka-iyo-barashada-luuqadda-english-ka.md",
    from: "en",
    to: "so",
    out: "src/content/blog/2025-11-03-wargelin-muhiim-ah-miftah-som-wuxuu-idiin-hayaa-waxbarashada-quraanka-kariimka-ah-far-barka-iyo-barashada-luuqadda-english-ka-so.md",
  },
  {
    src: "src/content/blog/2025-10-13-best-ways-to-improve-kids’-mentality.md",
    from: "en",
    to: "so",
    out: "src/content/blog/2025-10-13-best-ways-to-improve-kids’-mentality-so.md",
  },
];

async function translate(text, from, to) {
  if (!text.trim()) return "";
  const safe = text.replace(/[\uD800-\uDFFF]/g, "");
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    from +
    "&tl=" +
    to +
    "&dt=t&q=" +
    encodeURIComponent(safe);
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`translate failed ${res.status}`);
  const j = await res.json();
  return j[0].map((a) => a[0]).join("");
}

async function translateMd(body, from, to) {
  const parts = body.split(/\n{2,}/);
  const out = [];
  for (const p of parts) {
    let chunk = p.trim();
    const maxLen = 800;
    while (chunk.length > maxLen) {
      const slice = chunk.slice(0, maxLen);
      out.push(await translate(slice, from, to));
      chunk = chunk.slice(maxLen);
    }
    if (chunk) out.push(await translate(chunk, from, to));
  }
  return out.join("\n\n");
}

function cleanWordArtifacts(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\\[if[^>]*>[\s\S]*?\\[endif]/g, "")
    .replace(/\\[endif]/g, "")
    .replace(/\\[if[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function runTask(task) {
  const raw = readFileSync(path.resolve(task.src), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Invalid frontmatter in " + task.src);
  const [, fmBlock, body] = match;
  const fm = {};
  for (const line of fmBlock.split("\n").filter(Boolean)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^"+|"+$/g, "");
    fm[key] = val;
  }

  const bodyClean = cleanWordArtifacts(body);
  const excerptClean = fm.excerpt ? cleanWordArtifacts(fm.excerpt) : "";

  const newTitle = await translate(fm.title || task.src, task.from, task.to);
  const newExcerpt = excerptClean
    ? await translate(excerptClean, task.from, task.to)
    : "";
  const newBody = await translateMd(bodyClean, task.from, task.to);

  const newFm = {
    ...fm,
    title: newTitle,
    excerpt: newExcerpt,
    language: task.to,
  };
  const fmText = Object.entries(newFm)
    .map(([k, v]) => `${k}: "${v}"`)
    .join("\n");

  writeFileSync(
    path.resolve(task.out),
    `---\n${fmText}\n---\n\n${newBody}\n`,
    "utf8"
  );
  console.log("Wrote", task.out);
}

(async () => {
  for (const t of tasks) {
    await runTask(t);
  }
})();

