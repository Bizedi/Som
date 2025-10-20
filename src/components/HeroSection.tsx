import ArticleCard from './ArticleCard';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';
import { loadBlogPosts, type BlogPost } from '@/lib/contentLoader';
import { Link } from 'react-router-dom';

const HeroSection = () => {
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

  const hero = posts[0];
  const side = posts.slice(1, 3);

  return (
    <section className="container mx-auto px-4 lg:px-6">
      {/* Mobile: Al Jazeera Health Style */}
      <div className="lg:hidden py-6">
        {/* Featured Article - Al Jazeera Style */}
        {hero && (
          <div className="mb-8">
            <Link to={`/articles/${hero.slug}`} className="block group">
              {/* Image */}
              <div className="relative mb-4">
                <img 
                  src={hero.image} 
                  alt={hero.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-red-600 text-white px-2 py-1 text-xs font-semibold rounded">
                    {hero.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                  {hero.title}
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {hero.excerpt}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{new Date(hero.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Latest Articles Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t('articles.latest')}</h2>
            <Link to="/health" className="text-red-600 text-sm font-medium hover:underline">
              {t('articles.view-all')}
            </Link>
          </div>
          
          {/* Articles List */}
          <div className="space-y-4">
            {side.map((article, index) => (
              <Link key={index} to={`/articles/${article.slug}`} className="block group">
                <div className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(article.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-red-600 font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Al Jazeera Layout - Large right, two stacked left */}
      <div className="hidden lg:block py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Two Stacked Articles */}
          <div className="col-span-1 space-y-6">
            {side.map((article, index) => (
              <ArticleCard
                key={index}
                variant="small"
                title={article.title}
                excerpt={article.excerpt}
                image={article.image}
                category={article.category}
                date={article.date}
                href={`/articles/${article.slug}`}
              />
            ))}
          </div>

          {/* Right Column: Large Hero Article */}
          <div className="col-span-2">
            {hero && (
              <ArticleCard
                variant="hero"
                title={hero.title}
                excerpt={hero.excerpt}
                image={hero.image}
                category={hero.category}
                date={hero.date}
                href={`/articles/${hero.slug}`}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;