import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import ArticleCard from '@/components/ArticleCard';
import { Calendar, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import heroHealthImage from '@/assets/hero-health-nutrition.jpg';
import heroParentingImage from '@/assets/hero-parenting.jpg';
import heroQuranImage from '@/assets/hero-quran.jpg';
import { loadBlogPosts, type BlogPost } from '@/lib/contentLoader';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadBlogPosts(language);
      if (mounted) setPosts(data);
    })();
    return () => {
      mounted = false;
    };
  }, [language]);

  const article = useMemo(() => posts.find(p => p.slug === slug), [posts, slug]);
  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-2xl font-bold mb-4">{t('article.not-found') || 'Article not found'}</h1>
          <p className="text-text-secondary">{t('article.not-found-desc') || 'The article you are looking for may have been moved or unpublished.'}</p>
        </div>
      </Layout>
    );
  }

  const relatedArticles = [
    {
      title: "Healthy Breakfast Ideas for Growing Children",
      excerpt: "Start your child's day right with these nutritious and delicious breakfast options.",
      image: heroHealthImage,
      category: t('category.health.title'),
      date: "2025-01-10",
      href: "/articles/healthy-breakfast-children"
    },
    {
      title: "Teaching Children About Healthy Food Choices", 
      excerpt: "Practical strategies for educating kids about nutrition in an age-appropriate way.",
      image: heroParentingImage,
      category: t('category.parenting.title'),
      date: "2025-01-08",
      href: "/articles/teaching-healthy-food-choices"
    },
    {
      title: "Islamic Principles of Eating and Nutrition",
      excerpt: "Explore how Islamic teachings guide us toward mindful and healthy eating habits.",
      image: heroQuranImage,
      category: t('category.quran.title'),
      date: "2025-01-05",
      href: "/articles/islamic-principles-nutrition"
    }
  ];

  return (
    <Layout>
      {/* Article Header */}
      <article className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Article Content */}
          <div className="flex-1 max-w-4xl">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-category-health/10 text-category-health text-sm font-medium rounded-full">
                {article.category}
              </span>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Article Excerpt */}
            <p className="text-xl text-text-secondary mb-6 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-text-meta text-sm mb-8 pb-6 border-b border-border-light">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{t('article.author')}: {article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
              <span>{article.readTime}</span>
            </div>

            {/* Featured Image */}
            {article?.image && (
              <div className="mb-8">
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-large"
                />
              </div>
            )}

            {/* Social Share Bar - Floating Left */}
            <div className="hidden lg:block fixed left-8 top-1/2 transform -translate-y-1/2 z-10">
              <div className="flex flex-col gap-3 bg-background border border-border-light rounded-large p-3 shadow-sm">
                <button className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="p-2 text-text-secondary hover:text-blue-400 hover:bg-blue-50 rounded transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="p-2 text-text-secondary hover:text-blue-700 hover:bg-blue-50 rounded transition-colors">
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className="p-2 text-text-secondary hover:text-aljazeera-blue hover:bg-aljazeera-blue/10 rounded transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: article?.body || '' }}
              style={{
                lineHeight: '1.7',
                fontSize: '1.125rem'
              }}
            />

            {/* Mobile Social Share */}
            <div className="lg:hidden mt-8 pt-6 border-t border-border-light">
              <div className="flex items-center justify-center gap-4">
                <span className="text-text-secondary text-sm font-medium">{t('article.share')}:</span>
                <div className="flex gap-3">
                  <button className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-text-secondary hover:text-blue-400 hover:bg-blue-50 rounded transition-colors">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-text-secondary hover:text-blue-700 hover:bg-blue-50 rounded transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-12 p-6 bg-card-hover rounded-large border border-card-border">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-aljazeera-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{article.author}</h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('article.author-bio')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block">
            <Sidebar />
          </div>
        </div>

        {/* Related Articles */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">{t('article.related-articles')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((article, index) => (
              <ArticleCard
                key={index}
                title={article.title}
                excerpt={article.excerpt}
                image={article.image}
                category={article.category}
                date={article.date}
                href={article.href}
              />
            ))}
          </div>
        </section>
      </article>
    </Layout>
  );
};

export default ArticlePage;