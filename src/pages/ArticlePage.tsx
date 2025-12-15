import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import ArticleCard from '@/components/ArticleCard';
import { Calendar, User, Share2, Facebook, Twitter, Linkedin, Copy, Check, Link, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { loadBlogPosts, type BlogPost } from '@/lib/contentLoader';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Close share modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareModal && !(event.target as Element).closest('.share-modal')) {
        setShowShareModal(false);
      }
    };

    if (showShareModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareModal]);

  const article = useMemo(() => posts.find(p => p.slug === slug), [posts, slug]);

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article?.title || '';
  const shareText = `Check out this article: ${shareTitle}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

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
              <div className="relative">
                <button
                  onClick={() => setShowShareModal(!showShareModal)}
                  className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-md border border-border-light"
                  aria-label={t('share.title')}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('share.button')}</span>
                </button>

                {/* Share Modal */}
                {showShareModal && (
                  <div className="share-modal absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-background border border-border-light rounded-large shadow-lg p-4 z-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">{t('share.title')}</h4>
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="text-text-secondary hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>

                    {/* Copy Link Section */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Link className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm font-medium">{t('share.copy-link')}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm bg-card border border-border-light rounded text-foreground"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
                        >
                          {copySuccess ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span className="text-sm">{t('share.copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span className="text-sm">{t('share.copy-link')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Social Media Buttons */}
                    <div>
                      <span className="text-sm font-medium text-text-secondary mb-3 block">{t('share.social-media')}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={shareOnFacebook}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </button>
                        <button
                          onClick={shareOnTwitter}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-400 hover:bg-blue-500 text-white rounded transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </button>
                        <button
                          onClick={shareOnWhatsApp}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </button>
                        <button
                          onClick={shareOnLinkedIn}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </button>
                      </div>
                    </div>
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