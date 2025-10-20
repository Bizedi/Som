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
    writeBundle() {
      try {
        const files = listMarkdownFiles(blogDir);
        const posts = files.map((file) => {
          const raw = readFileSync(file, 'utf8');
          const { content, data } = matter(raw);
          const html = marked.parse(content) as string;
          const slug = toSlug(file);
          // Infer language if missing using filename suffix and Somali category labels
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
          const inferredLanguage = (data as any).language ?? (hasSomaliFilename || isSomaliCategory ? 'so' : 'en');
          return {
            title: data.title,
            date: data.date,
            image: data.image,
            category: data.category,
            excerpt: data.excerpt,
            author: data.author ?? 'Miftah Som Academy',
            readTime: data.readTime ?? '5 min read',
            language: inferredLanguage,
            slug,
            html,
          };
        });
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
