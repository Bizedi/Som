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
  const key = `${source}:${target}:${text}`;
  const cached = translationCache.get(key);
  if (cached) return cached;
  
  // Clean the text first
  const cleanText = cleanWordArtifacts(text);
  if (!cleanText.trim()) return text;
  
  try {
    // Use MyMemory API (free, no key required)
    const sourceLang = source === 'so' ? 'so' : 'en';
    const targetLang = target === 'so' ? 'so' : 'en';
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${sourceLang}|${targetLang}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: any = await res.json();
    
    if (json.responseStatus === 200 && json.responseData?.translatedText) {
      const translated = json.responseData.translatedText;
      translationCache.set(key, translated);
      return translated;
    }
    
    // Fallback: try Google Translate (free tier)
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const googleRes = await fetch(googleUrl);
    if (googleRes.ok) {
      const googleJson: any = await googleRes.json();
      if (googleJson[0] && googleJson[0][0] && googleJson[0][0][0]) {
        const translated = googleJson[0][0][0];
        translationCache.set(key, translated);
        return translated;
      }
    }
    
    return cleanText; // Return cleaned text if translation fails
  } catch {
    return cleanText; // Return cleaned text on any failure
  }
}

// Plugin to generate a JSON feed of pages at build time and dev server start
const generatePagesJson = () => {
  const pagesDir = path.resolve(__dirname, 'src/content/pages');

  const generatePages = (outputDir: string) => {
    try {
      if (!existsSync(pagesDir)) {
        return;
      }

      const files = readdirSync(pagesDir).filter(f => f.endsWith('.md') && f !== 'home.md');
      const pages: Array<{ slug: string; title: string; html: string; language: 'en' | 'so' }> = [];

      for (const file of files) {
        const filePath = path.join(pagesDir, file);
        const raw = readFileSync(filePath, 'utf8');
        const { content, data } = matter(raw);
        const baseSlug = file.replace(/\.md$/, '').replace(/-so$/, '');
        const isSomali = file.includes('-so.md') || (data as any).language === 'so';
        const language: 'en' | 'so' = isSomali ? 'so' : 'en';

        pages.push({
          slug: baseSlug,
          title: (data as any).title || baseSlug.charAt(0).toUpperCase() + baseSlug.slice(1),
          html: marked.parse(cleanWordArtifacts(content)) as string,
          language,
        });
      }

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      writeFileSync(path.join(outputDir, 'pages.json'), JSON.stringify(pages, null, 2), 'utf8');
      // eslint-disable-next-line no-console
      console.log(`[generate-pages-json] Wrote ${pages.length} pages to ${path.join(outputDir, 'pages.json')}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[generate-pages-json] Failed to generate pages.json', err);
    }
  };

  return {
    name: 'generate-pages-json',
    buildStart() {
      // Generate for dev server (in public directory so it's served)
      const publicDir = path.resolve(__dirname, 'public');
      generatePages(publicDir);
    },
    async writeBundle() {
      // Generate for production build (in dist directory)
      const distDir = path.resolve(__dirname, 'dist');
      generatePages(distDir);
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
          
          // Clean Word artifacts from content
          const cleanContent = cleanWordArtifacts(content);
          const cleanTitle = cleanWordArtifacts(title);
          const cleanExcerpt = cleanWordArtifacts((data as any).excerpt || '');
          
          return {
            title: cleanTitle,
            date: (data as any).date,
            image: (data as any).image,
            category: (data as any).category,
            excerpt: cleanExcerpt,
            author: (data as any).author ?? 'Miftah Som Academy',
            readTime: (data as any).readTime ?? '5 min read',
            language: inferredLanguage as 'en' | 'so',
            slug,
            rawContent: cleanContent,
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
    generatePagesJson(),
    generatePostsJson()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
