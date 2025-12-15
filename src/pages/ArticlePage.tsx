import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import ArticleCard from '@/components/ArticleCard';
import { Calendar, User, Share2, Facebook, Twitter, Linkedin, MessageCircle, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { loadBlogPosts, type BlogPost } from '@/lib/contentLoader';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article?.title || '';
  const shareText = `Check out this article: ${shareTitle}`;

  const shareOnFacebook = () => {
    try {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Error sharing on Facebook:', error);
    }
  };

  const shareOnTwitter = () => {
    try {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Error sharing on Twitter:', error);
    }
  };

  const shareOnWhatsApp = () => {
    try {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error sharing on WhatsApp:', error);
    }
  };

  const shareOnLinkedIn = () => {
    try {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Error sharing on LinkedIn:', error);
    }
  };

  const socialPlatforms = [
    {
      id: 'facebook',
      label: 'Facebook',
      onClick: shareOnFacebook,
      icon: Facebook,
      bg: 'bg-[#1d4ed8]',
      hover: 'hover:bg-[#1b44b5]',
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      onClick: shareOnTwitter,
      icon: Twitter,
      bg: 'bg-[#0ea5e9]',
      hover: 'hover:bg-[#0284c7]',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      onClick: shareOnWhatsApp,
      icon: MessageCircle,
      bg: 'bg-[#16a34a]',
      hover: 'hover:bg-[#15803d]',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      onClick: shareOnLinkedIn,
      icon: Linkedin,
      bg: 'bg-[#0a66c2]',
      hover: 'hover:bg-[#0a58a8]',
    },
  ];

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
      title: t('related.breakfast-title'),
      excerpt: t('related.breakfast-excerpt'),
      image: "/images/hero-health-nutrition.jpg",
      category: t('category.health.title'),
      date: "2025-01-10",
      href: "/articles/healthy-breakfast-children"
    },
    {
      title: t('related.teaching-title'),
      excerpt: t('related.teaching-excerpt'),
      image: "/images/hero-parenting.jpg",
      category: t('category.parenting.title'),
      date: "2025-01-08",
      href: "/articles/teaching-healthy-food-choices"
    },
    {
      title: t('related.islamic-title'),
      excerpt: t('related.islamic-excerpt'),
      image: "/images/hero-quran.jpg",
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
            <div className="flex flex-wrap items-center justify-between gap-6 text-text-meta text-sm mb-8 pb-6 border-b border-border-light">
              <div className="flex flex-wrap items-center gap-6">
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

              {/* Share Button */}
              <div className="share-inline">
                <button
                  onClick={() => setShowShareModal(!showShareModal)}
                  aria-pressed={showShareModal}
                  aria-expanded={showShareModal}
                  data-active={showShareModal}
                  className={`share-toggle group ${showShareModal ? 'is-active' : ''}`}
                  aria-label={t('share.title')}
                >
                  <span className="share-icon group-hover:scale-105" aria-hidden="true">
                    <Share2 className="w-4 h-4" />
                  </span>
                  <div className="share-label">
                    <span className="share-label__title">{t('share.button')}</span>
                    <span className="share-label__hint">{t('article.share')}</span>
                  </div>
                  <ChevronDown className={`share-chevron ${showShareModal ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {showShareModal && (
                  <div className="share-inline__icons" role="group" aria-label={t('share.social-media')}>
                    {socialPlatforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <button
                          key={platform.id}
                          onClick={platform.onClick}
                          className={`share-inline__pill ${platform.bg} ${platform.hover}`}
                          aria-label={`Share on ${platform.label}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: article?.body || '' }}
              style={{
                lineHeight: '1.7',
                fontSize: '1.125rem'
              }}
            />

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