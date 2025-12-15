import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import ArticleCard from '@/components/ArticleCard';
import { Calendar, User, Share2, Facebook, Linkedin, Copy, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { loadBlogPosts, type BlogPost } from '@/lib/contentLoader';

const WhatsAppIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 256 256"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M128 20a108 108 0 0 0-92.88 160l-7.4 37.36a8 8 0 0 0 9.56 9.4L74.52 219A108 108 0 1 0 128 20Zm0 200a92 92 0 0 1-46.8-12.94 8 8 0 0 0-4.08-1.12 8.21 8.21 0 0 0-1.58.16l-26.52 5.3 5.3-26.52a8 8 0 0 0-1-5.66A92 92 0 1 1 128 220Zm49-63.44c-2.94-1.46-17.38-8.56-20.06-9.54s-4.68-1.46-6.64 1.48-7.58 9.54-9.3 11.52-3.44 2-6.38.52-12.46-4.6-23.73-14.69c-8.78-7.84-14.7-17.52-16.42-20.46s-.18-4.54 1.28-6a55.73 55.73 0 0 0 3.74-5.38 5.37 5.37 0 0 0-.26-5.08c-.74-1.46-6.64-16-9.09-21.92-2.39-5.76-4.82-5-6.64-5.08s-3.62-.12-5.56-.12a10.7 10.7 0 0 0-7.72 3.6c-2.64 2.86-10.06 9.84-10.06 24s10.3 27.72 11.74 29.64 20.26 30.92 49 43.34a166.31 166.31 0 0 0 16.52 6.08c6.94 2.2 13.26 1.89 18.25 1.14 5.56-.82 17.12-7 19.53-13.82s2.41-12.6 1.69-13.82-2.66-1.88-5.6-3.34Z" />
  </svg>
);

const XIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="currentColor"
  >
    <path d="M3.5 3h4.4l4.1 5.6L15.9 3H21l-6.1 7.5L21.3 21h-4.4l-4.5-6.2L7.3 21H3l6.3-7.6L3.5 3Zm2.16 1.5 3.62 5.04-6.01 7.26h1.77l5-6.02 4.37 6.02h1.91l-3.99-5.5L18.82 4.5h-1.75l-4.4 5.37L8.72 4.5H5.66Z" />
  </svg>
);

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
    } catch {
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
      const text = encodeURIComponent(`${shareText} ${shareUrl}`);
      const ua = navigator.userAgent || '';
      const isAndroid = /Android/i.test(ua);
      const isiOS = /iPhone|iPad|iPod/i.test(ua);

      if (isAndroid) {
        const intentChooser = `intent://send?text=${text}#Intent;scheme=whatsapp;end`; // no package -> lets Android surface WA vs WA Business
        const intentPrimary = `intent://send?text=${text}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
        const intentBusiness = `intent://send?text=${text}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
        const webFallback = `https://wa.me/?text=${text}`;

        // Try chooser first (no package), then classic, then business, then web fallback
        window.location.href = intentChooser;
        setTimeout(() => {
          window.location.href = intentPrimary;
          setTimeout(() => {
            window.location.href = intentBusiness;
            setTimeout(() => {
              window.open(webFallback, '_blank');
            }, 500);
          }, 500);
        }, 500);
        return;
      }

      if (isiOS) {
        const deep = `whatsapp://send?text=${text}`;
        const webFallback = `https://wa.me/?text=${text}`;
        window.location.href = deep;
        setTimeout(() => {
          window.open(webFallback, '_blank');
        }, 700);
        return;
      }

      // Desktop / other platforms
      window.open(`https://wa.me/?text=${text}`, '_blank');
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
      id: 'x',
      label: 'X',
      onClick: shareOnTwitter,
      icon: XIcon,
      bg: 'bg-[#0f1419]',
      hover: 'hover:bg-black',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      onClick: shareOnWhatsApp,
      icon: WhatsAppIcon,
      bg: 'bg-[#25d366]',
      hover: 'hover:bg-[#1ebe5b]',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      onClick: shareOnLinkedIn,
      icon: Linkedin,
      bg: 'bg-[#0a66c2]',
      hover: 'hover:bg-[#0a58a8]',
    },
    {
      id: 'copy',
      label: t('share.copy-link'),
      onClick: copyToClipboard,
      icon: copySuccess ? Check : Copy,
      bg: copySuccess ? 'bg-emerald-600' : 'bg-[#111827]',
      hover: copySuccess ? 'hover:bg-emerald-600' : 'hover:bg-[#0b1220]',
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