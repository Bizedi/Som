import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTranslation } from '@/contexts/TranslationContext';

interface PageData {
  title: string;
  body: string;
}

interface Page {
  slug: string;
  title: string;
  html: string;
  language?: 'en' | 'so';
}

const Page = () => {
  const location = useLocation();
  const { t, language } = useTranslation();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      // Get slug from pathname (remove leading slash)
      const slug = location.pathname.replace(/^\//, '');
      
      if (!slug) {
        setError('Page not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load pages.json
        const response = await fetch('/pages.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch pages.json: ${response.status}`);
        }

        const pages: Page[] = await response.json();
        // Find page by slug and prefer current language, fallback to any language
        const pageForLanguage = pages.find(p => p.slug === slug && p.language === language);
        const pageAny = pages.find(p => p.slug === slug);
        const page = pageForLanguage || pageAny;

        if (!page) {
          throw new Error('Page not found');
        }

        setPageData({
          title: page.title,
          body: page.html
        });
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Page not found');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [location.pathname, language]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-text-secondary">{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !pageData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{t('404.title') || 'Page Not Found'}</h1>
            <p className="text-text-secondary mb-6">{t('404.message') || 'The page you are looking for does not exist.'}</p>
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              {t('404.return-home') || 'Return to Home'}
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            {pageData.title}
          </h1>
          <div 
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-text-secondary prose-a:text-blue-600 prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: pageData.body }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Page;

