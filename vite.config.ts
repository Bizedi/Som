import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import matter from "gray-matter";
import { marked } from "marked";

// Plugin to copy admin files during build
const copyAdminFiles = () => {
  return {
    name: 'copy-admin-files',
    writeBundle() {
      const adminDir = path.resolve(__dirname, 'dist/admin');
      if (!existsSync(adminDir)) {
        mkdirSync(adminDir, { recursive: true });
      }
      copyFileSync('public/admin/index.html', 'dist/admin/index.html');
      copyFileSync('public/admin/config.yml', 'dist/admin/config.yml');
    }
  };
};

// Copy hero images to dist/images so absolute /images/hero-*.jpg work in posts
const copyHeroImages = () => {
  return {
    name: 'copy-hero-images',
    writeBundle() {
      const srcDir = path.resolve(__dirname, 'src/assets');
      const outDir = path.resolve(__dirname, 'dist/images');
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }
      const heroFiles = [
        'hero-baby-names.jpg',
        'hero-education.jpg',
        'hero-health-nutrition.jpg',
        'hero-parenting.jpg',
        'hero-quran.jpg',
      ];
      for (const file of heroFiles) {
        const from = path.join(srcDir, file);
        const to = path.join(outDir, file);
        if (existsSync(from)) {
          copyFileSync(from, to);
        }
      }
    }
  };
};

// Simple category translation map between English and Somali labels used in content
const categoryTranslateMap: Record<string, { en: string; so: string }> = {
  Health: { en: "Health", so: "Caafimaad" },
  Parenting: { en: "Parenting", so: "Barbaarinta Carruurta" },
  Education: { en: "Education", so: "Waxbarasho" },
  Quran: { en: "Quran", so: "Quraanka" },
  "Baby Names": { en: "Baby Names", so: "Magacyada Carruurta" },
  // Somali to English direct keys (for when source is Somali)
  "Caafimaad": { en: "Health", so: "Caafimaad" },
  "Barbaarinta Carruurta": { en: "Parenting", so: "Barbaarinta Carruurta" },
  "Waxbarasho": { en: "Education", so: "Waxbarasho" },
  "Quraanka": { en: "Quran", so: "Quraanka" },
  "Magacyada Carruurta": { en: "Baby Names", so: "Magacyada Carruurta" },
};

// Very small in-memory translation cache for build step
const translationCache = new Map<string, string>();

// LibreTranslate helper (uses public endpoint; best-effort, no API key)
async function translateText(text: string, source: 'en' | 'so', target: 'en' | 'so'): Promise<string> {
  if (!text || source === target) return text;
  const key = `${source}:${target}:${text}`;
  const cached = translationCache.get(key);
  if (cached) return cached;
  try {
    const endpoint = process.env.LIBRE_TRANSLATE_ENDPOINT || 'https://libretranslate.de/translate';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: any = await res.json();
    const translated = (json?.translatedText as string) ?? text;
    translationCache.set(key, translated);
    return translated;
  } catch {
    return text; // graceful fallback on any failure
  }
}

// Plugin to generate a JSON feed of blog posts at build time as a fallback
const generatePostsJson = () => {
  const blogDir = path.resolve(__dirname, 'src/content/blog');

  const listMarkdownFiles = (dir: string): string[] => {
    if (!existsSync(dir)) return [];
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) files.push(...listMarkdownFiles(full));
      else if (full.endsWith('.md')) files.push(full);
    }
    return files;
  };

  const toSlug = (filePath: string): string => {
    const base = path.basename(filePath).replace(/\.md$/, '');
    return base.replace(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-/, '');
  };

  return {
    name: 'generate-posts-json',
    async writeBundle() {
      try {
        const files = listMarkdownFiles(blogDir);
        // First pass: collect originals with raw markdown
        const originals = files.map((file) => {
          const raw = readFileSync(file, 'utf8');
          const { content, data } = matter(raw);
          const slug = toSlug(file);
          const base = path.basename(file).replace(/\.md$/, '');
          const hasSomaliFilename = /(^|-)so$/i.test(base);
          const categoryValue = (data as any).category as string | undefined;
          const isSomaliCategory = [
            'Caafimaad',
            'Barbaarinta Carruurta',
            'Waxbarasho',
            'Quraanka',
            'Magacyada Carruurta',
          ].some(label => (categoryValue ?? '').toLowerCase() === label.toLowerCase());
          const title = (data as any).title as string | undefined ?? "";
          const hasSomaliContent = /[ء-ي]/.test(title + content) || /(hooyo|aabo|waxbarasho|caafimaad|qoys|carruur|islaam|quraan)/i.test(title + content);
          const inferredLanguage = (data as any).language ?? (hasSomaliFilename || isSomaliCategory || hasSomaliContent ? 'so' : 'en');
          return {
            title: (data as any).title as string | undefined,
            date: (data as any).date,
            image: (data as any).image,
            category: (data as any).category,
            excerpt: (data as any).excerpt,
            author: (data as any).author ?? 'Miftah Som Academy',
            readTime: (data as any).readTime ?? '5 min read',
            language: inferredLanguage as 'en' | 'so',
            slug,
            rawContent: content,
          } as {
            title?: string; date?: string; image?: string; category?: string; excerpt?: string; author?: string; readTime?: string; language: 'en' | 'so'; slug: string; rawContent: string;
          };
        });

        // Optionally auto-translate to ensure both languages exist per slug
        // Enable auto-translation by default for smooth operation unless explicitly disabled
        const autoTranslateEnabled = (process.env.AUTO_TRANSLATE || 'true').toLowerCase() === 'true';
        const bySlug = new Map<string, { en?: typeof originals[0]; so?: typeof originals[0] }>();
        for (const p of originals) {
          const entry = bySlug.get(p.slug) || {};
          entry[p.language] = p as any;
          bySlug.set(p.slug, entry);
        }

        const enriched: Array<{ title?: string; date?: string; image?: string; category?: string; excerpt?: string; author?: string; readTime?: string; language: 'en' | 'so'; slug: string; rawContent: string; }> = [];
        for (const [slug, languages] of bySlug.entries()) {
          if (languages.en) enriched.push(languages.en);
          if (languages.so) enriched.push(languages.so);
          if (!autoTranslateEnabled) continue;
          if (!languages.en && languages.so) {
            const src = languages.so;
            const title = await translateText(src.title || slug, 'so', 'en');
            const excerpt = src.excerpt ? await translateText(src.excerpt, 'so', 'en') : '';
            const bodyMd = await translateText(src.rawContent, 'so', 'en');
            const category = src.category ? (categoryTranslateMap[src.category]?.en || src.category) : undefined;
            enriched.push({
              title,
              date: src.date,
              image: src.image,
              category,
              excerpt,
              author: src.author,
              readTime: src.readTime,
              language: 'en',
              slug,
              rawContent: bodyMd,
            });
          }
          if (!languages.so && languages.en) {
            const src = languages.en;
            const title = await translateText(src.title || slug, 'en', 'so');
            const excerpt = src.excerpt ? await translateText(src.excerpt, 'en', 'so') : '';
            const bodyMd = await translateText(src.rawContent, 'en', 'so');
            const category = src.category ? (categoryTranslateMap[src.category]?.so || src.category) : undefined;
            enriched.push({
              title,
              date: src.date,
              image: src.image,
              category,
              excerpt,
              author: src.author,
              readTime: src.readTime,
              language: 'so',
              slug,
              rawContent: bodyMd,
            });
          }
        }

        // Convert all to final JSON structure (with rendered HTML)
        const posts = enriched.map((p) => ({
          title: p.title,
          date: p.date,
          image: p.image,
          category: p.category,
          excerpt: p.excerpt,
          author: p.author,
          readTime: p.readTime,
          language: p.language,
          slug: p.slug,
          html: marked.parse(p.rawContent) as string,
        }));

        posts.sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime());

        const distDir = path.resolve(__dirname, 'dist');
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        writeFileSync(path.join(distDir, 'posts.json'), JSON.stringify(posts, null, 2), 'utf8');
        // eslint-disable-next-line no-console
        console.log(`[generate-posts-json] Wrote ${posts.length} posts to dist/posts.json`);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[generate-posts-json] Failed to generate posts.json', err);
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    copyAdminFiles(),
    copyHeroImages(),
    generatePostsJson()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
