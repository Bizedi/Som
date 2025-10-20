import { Mail, TrendingUp, BookOpen, Heart, GraduationCap, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroParentingImage from '@/assets/hero-parenting.jpg';
import heroQuranImage from '@/assets/hero-quran.jpg';
import heroBabyNamesImage from '@/assets/hero-baby-names.jpg';
import { useTranslation } from '@/contexts/TranslationContext';

const Sidebar = () => {
  const { t } = useTranslation();
  
  const popularPosts = [
    {
      title: t('sidebar.essential-parenting'),
      image: heroParentingImage,
      href: "/articles/essential-parenting-tips",
      category: t('category.parenting.title')
    },
    {
      title: t('sidebar.islamic-names'),
      image: heroBabyNamesImage,
      href: "/articles/islamic-names-meanings",
      category: t('category.baby-names.title')
    },
    {
      title: t('sidebar.daily-quran'),
      image: heroQuranImage,
      href: "/articles/daily-quran-reading-habits",
      category: t('category.quran.title')
    }
  ];

  const categories = [
    { name: t('category.health.title'), slug: 'health', count: 24, icon: Heart, color: "text-category-health" },
    { name: t('category.parenting.title'), slug: 'parenting', count: 18, icon: Heart, color: "text-category-parenting" },
    { name: t('category.baby-names.title'), slug: 'baby-names', count: 32, icon: Bookmark, color: "text-category-baby-names" },
    { name: t('category.education.title'), slug: 'education', count: 15, icon: GraduationCap, color: "text-category-education" },
    { name: t('category.quran.title'), slug: 'quran', count: 21, icon: BookOpen, color: "text-category-quran" }
  ];

  return (
    <aside className="w-80 space-y-8">
      {/* Popular Posts Section */}
      <div className="bg-card border border-card-border rounded-large p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-aljazeera-blue mr-2" />
          <h3 className="text-lg font-semibold text-card-foreground">{t('common.popular-articles')}</h3>
        </div>
        <div className="space-y-4">
          {popularPosts.map((post, index) => (
            <Link 
              key={index} 
              to={post.href}
              className="flex gap-3 group hover:bg-card-hover p-2 rounded -m-2 transition-colors"
            >
              <img 
                src={post.image} 
                alt={post.title}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
              <div>
                <span className="text-small text-text-meta font-medium">
                  {post.category}
                </span>
                <h4 className="text-sm font-medium text-card-foreground group-hover:text-aljazeera-blue transition-colors line-clamp-2 leading-snug mt-1">
                  {post.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-card border border-card-border rounded-large p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">{t('common.categories')}</h3>
        <div className="space-y-3">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={index}
                to={`/categories/${category.slug}`}
                className="flex items-center justify-between py-2 px-3 rounded hover:bg-card-hover transition-colors group"
              >
                <div className="flex items-center">
                  <IconComponent className={`w-4 h-4 mr-3 ${category.color}`} />
                  <span className="text-card-foreground group-hover:text-aljazeera-blue transition-colors">
                    {category.name}
                  </span>
                </div>
                <span className="text-small text-text-meta bg-border-light px-2 py-1 rounded">
                  {category.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-aljazeera-blue rounded-large p-6 text-white">
        <div className="flex items-center mb-4">
          <Mail className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-semibold">{t('common.stay-updated')}</h3>
        </div>
        <p className="text-sm opacity-90 mb-4">
          {t('common.newsletter-description')}
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder={t('common.email-placeholder')}
            className="w-full px-3 py-2 rounded text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            className="w-full bg-white text-aljazeera-blue py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            {t('common.subscribe')}
          </button>
        </form>
      </div>
    </aside>
  );
};

export default Sidebar;