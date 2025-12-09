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
const autoTranslateEnabled = (process.env.AUTO_TRANSLATE || 'true').toLowerCase() === 'true';
const azureTranslatorKey = process.env.AZURE_TRANSLATOR_KEY;
const azureTranslatorRegion = process.env.AZURE_TRANSLATOR_REGION;
const azureTranslatorEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
const preferAzure = (process.env.PREFER_AZURE || 'false').toLowerCase() === 'true';

interface MyMemoryResponse {
  responseStatus: number;
  responseData?: {
    translatedText?: string;
  };
}

interface AzureTranslation {
  text?: string;
}

type AzureResponse = Array<{
  translations?: AzureTranslation[];
}>;

interface FrontMatter {
  title?: string;
  date?: string;
  image?: string;
  category?: string;
  excerpt?: string;
  author?: string;
  readTime?: string;
  language?: 'en' | 'so';
}

interface OriginalPost {
  title?: string;
  date?: string;
  image?: string;
  category?: string;
  excerpt?: string;
  author?: string;
  readTime?: string;
  language: 'en' | 'so';
  slug: string;
  rawContent: string;
}

// Clean Microsoft Word HTML artifacts from content
function cleanWordArtifacts(text: string): string {
  return text
    .replace(/<!--\\[if[^>]*>[\s\S]*?<!\\[endif]-->/g, '') // Remove Word conditional comments
    .replace(/<w:[^>]*>/g, '') // Remove Word XML tags
    .replace(/<m:[^>]*>/g, '') // Remove Word math tags
    .replace(/<o:[^>]*>/g, '') // Remove Word object tags
    .replace(/<v:[^>]*>/g, '') // Remove Word VML tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Remove style blocks
    .replace(/<xml[^>]*>[\s\S]*?<\/xml>/g, '') // Remove XML blocks
    .replace(/\\[if[^>]*>[\s\S]*?\\[endif]/g, '') // Remove escaped conditionals
    .replace(/\\[endif]/g, '') // Remove escaped endif
    .replace(/\\[if[^>]*>/g, '') // Remove escaped if
    .trim();
}

// MyMemory API helper (free, no API key required)
async function translateText(text: string, source: 'en' | 'so', target: 'en' | 'so'): Promise<string> {
  if (!text || source === target) return text;
  const cleanText = cleanWordArtifacts(text);
  if (!cleanText.trim()) return text;

  const key = `${source}:${target}:${cleanText}`;
  const cached = translationCache.get(key);
  if (cached) return cached;

  const sourceLang = source === 'so' ? 'so' : 'en';
  const targetLang = target === 'so' ? 'so' : 'en';

  // 1) Google translate public endpoint (most reliable fallback)
  try {
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const googleRes = await fetch(googleUrl);
    if (googleRes.ok) {
      const googleJson = (await googleRes.json()) as unknown;
      const translated =
        Array.isArray(googleJson) &&
        Array.isArray(googleJson[0]) &&
        Array.isArray(googleJson[0][0]) &&
        typeof googleJson[0][0][0] === 'string'
          ? googleJson[0][0][0]
          : undefined;
      if (translated) {
        translationCache.set(key, translated);
        return translated;
      }
    }
  } catch {
    // ignore and fall through
  }

  // 2) MyMemory (free)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = (await res.json()) as unknown;
      const typed = json as MyMemoryResponse;
      if (typed.responseStatus === 200 && typed.responseData?.translatedText) {
        const translated = typed.responseData.translatedText;
        translationCache.set(key, translated);
        return translated;
      }
    }
  } catch {
    // ignore and try azure fallback
  }

  // 3) Optional Azure (only if explicitly preferred and credentials provided)
  if (preferAzure && azureTranslatorKey) {
    try {
      const azureUrl = `${azureTranslatorEndpoint}/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`;
      const azureRes = await fetch(azureUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureTranslatorKey,
          ...(azureTranslatorRegion ? { 'Ocp-Apim-Subscription-Region': azureTranslatorRegion } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ Text: cleanText }])
      });

      if (azureRes.ok) {
        const azureJson = (await azureRes.json()) as unknown;
        const typed = azureJson as AzureResponse;
        const translated = typed[0]?.translations?.[0]?.text;
        if (translated) {
          translationCache.set(key, translated);
          return translated;
        }
      }
    } catch {
      // swallow and return clean text
    }
  }

  // Last resort return cleaned text to avoid empty strings
  return cleanText;
}

// Plugin to generate a JSON feed of pages at build time and dev server start
const generatePagesJson = () => {
  const pagesDir = path.resolve(__dirname, 'src/content/pages');

  const generatePages = async (outputDir: string) => {
    try {
      if (!existsSync(pagesDir)) return;

      const files = readdirSync(pagesDir).filter(f => f.endsWith('.md') && f !== 'home.md');
      const originals: Array<{ slug: string; title: string; rawContent: string; language: 'en' | 'so' }> = [];

      for (const file of files) {
        const filePath = path.join(pagesDir, file);
        const raw = readFileSync(filePath, 'utf8');
        const { content, data } = matter(raw);
        const fm = data as FrontMatter;
        const baseSlug = file.replace(/\.md$/, '').replace(/-so$/, '');
        const isSomali = file.includes('-so.md') || fm.language === 'so';
        const language: 'en' | 'so' = isSomali ? 'so' : 'en';

        originals.push({
          slug: baseSlug,
          title: cleanWordArtifacts(fm.title || baseSlug.charAt(0).toUpperCase() + baseSlug.slice(1)),
          rawContent: cleanWordArtifacts(content),
          language,
        });
      }

      const bySlug = new Map<string, { en?: typeof originals[number]; so?: typeof originals[number] }>();
      for (const page of originals) {
        const entry = bySlug.get(page.slug) || {};
        entry[page.language] = page;
        bySlug.set(page.slug, entry);
      }

      const enriched: typeof originals = [];
      for (const [slug, langs] of bySlug.entries()) {
        if (langs.en) enriched.push(langs.en);
        if (langs.so) enriched.push(langs.so);

        if (!autoTranslateEnabled) continue;

        if (!langs.en && langs.so) {
          const translatedTitle = await translateText(langs.so.title, 'so', 'en');
          const translatedBody = await translateText(langs.so.rawContent, 'so', 'en');
          enriched.push({ slug, title: translatedTitle, rawContent: translatedBody, language: 'en' });
        }

        if (!langs.so && langs.en) {
          const translatedTitle = await translateText(langs.en.title, 'en', 'so');
          const translatedBody = await translateText(langs.en.rawContent, 'en', 'so');
          enriched.push({ slug, title: translatedTitle, rawContent: translatedBody, language: 'so' });
        }
      }

      const pages = enriched.map(page => ({
        slug: page.slug,
        title: page.title,
        html: marked.parse(page.rawContent) as string,
        language: page.language,
      }));

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      writeFileSync(path.join(outputDir, 'pages.json'), JSON.stringify(pages, null, 2), 'utf8');
      console.log(`[generate-pages-json] Wrote ${pages.length} pages to ${path.join(outputDir, 'pages.json')}`);
    } catch (err) {
      console.error('[generate-pages-json] Failed to generate pages.json', err);
    }
  };

  return {
    name: 'generate-pages-json',
    async buildStart() {
      const publicDir = path.resolve(__dirname, 'public');
      await generatePages(publicDir);
    },
    async writeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      await generatePages(distDir);
    }
  };
};

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

  const generatePosts = async (outputDir: string) => {
    try {
      const files = listMarkdownFiles(blogDir);
      // First pass: collect originals with raw markdown
      const originals: OriginalPost[] = files.map((file): OriginalPost => {
        const raw = readFileSync(file, 'utf8');
        const { content, data } = matter(raw);
        const fm = data as FrontMatter;
        const slug = toSlug(file);
        const base = path.basename(file).replace(/\.md$/, '');
        const hasSomaliFilename = /(^|-)so$/i.test(base);
        const categoryValue = fm.category;
        const isSomaliCategory = [
          'Caafimaad',
          'Barbaarinta Carruurta',
          'Waxbarasho',
          'Quraanka',
          'Magacyada Carruurta',
        ].some(label => (categoryValue ?? '').toLowerCase() === label.toLowerCase());
        const title = fm.title ?? "";
        const hasSomaliContent = /[ء-ي]/.test(title + content) || /(hooyo|aabo|waxbarasho|caafimaad|qoys|carruur|islaam|quraan)/i.test(title + content);
        const inferredLanguage = fm.language ?? (hasSomaliFilename || isSomaliCategory || hasSomaliContent ? 'so' : 'en');
        
        // Clean Word artifacts from content
        const cleanContent = cleanWordArtifacts(content);
        const cleanTitle = cleanWordArtifacts(title);
        const cleanExcerpt = cleanWordArtifacts(fm.excerpt || '');
        
        return {
          title: cleanTitle,
          date: fm.date,
          image: fm.image,
          category: fm.category,
          excerpt: cleanExcerpt,
          author: fm.author ?? 'Miftah Som Academy',
          readTime: fm.readTime ?? '5 min read',
          language: inferredLanguage as 'en' | 'so',
          slug,
          rawContent: cleanContent,
        };
      });

      const bySlug = new Map<string, { en?: OriginalPost; so?: OriginalPost }>();
      for (const p of originals) {
        const entry = bySlug.get(p.slug) || {};
        entry[p.language] = p;
        bySlug.set(p.slug, entry);
      }

      const enriched: OriginalPost[] = [];
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

      posts.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      writeFileSync(path.join(outputDir, 'posts.json'), JSON.stringify(posts, null, 2), 'utf8');
      console.log(`[generate-posts-json] Wrote ${posts.length} posts to ${path.join(outputDir, 'posts.json')}`);
    } catch (err) {
      console.error('[generate-posts-json] Failed to generate posts.json', err);
    }
  };

  return {
    name: 'generate-posts-json',
    async buildStart() {
      // Generate for dev server so translations are available locally
      const publicDir = path.resolve(__dirname, 'public');
      await generatePosts(publicDir);
    },
    async writeBundle() {
      // Generate for production build
      const distDir = path.resolve(__dirname, 'dist');
      await generatePosts(distDir);
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
    generatePagesJson(),
    generatePostsJson()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
