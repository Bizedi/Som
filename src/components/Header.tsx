import { useState, useEffect, useRef } from 'react';
import { Search, Globe, Menu, X, Youtube, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { loadBlogPosts, type BlogPost } from '@/lib/contentLoader';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage, t } = useTranslation();

  // Load all posts for search
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await loadBlogPosts(language);
        setAllPosts(posts);
      } catch (error) {
        console.error('Error loading posts for search:', error);
      }
    };
    loadPosts();
  }, [language]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simple search implementation - search in title, excerpt, and category
    const filtered = allPosts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or handle search
      console.log('Searching for:', searchQuery);
      setSearchOpen(false);
    }
  };

  const handleResultClick = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const navigationItems = [
    { title: t('nav.health'), href: '/health', active: true },
    { title: t('nav.parenting'), href: '/parenting' },
    { title: t('nav.baby-names'), href: '/baby-names' },
    { title: t('nav.education'), href: '/education' },
    { title: t('nav.quran'), href: '/quran' },
  ];

  return (
    <header className="bg-background border-b border-border-light sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="Miftah Som">
            {/* Desktop logo */}
            <img
              src="/images/logo.png"
              alt="Miftah Som"
              className="hidden sm:block h-10 w-auto object-contain"
              loading="eager"
            />
            {/* Mobile logo */}
            <img
              src="/images/logo.png"
              alt="Miftah Som"
              className="sm:hidden h-8 w-auto object-contain"
              loading="eager"
            />
			<span className="ml-3 text-base sm:text-lg font-semibold text-foreground whitespace-nowrap">Mifta Som Academy</span>
            <span className="sr-only">Miftah Som Academy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 relative group ${
                  item.active
                    ? 'text-blue-600'
                    : 'text-text-secondary'
                }`}
              >
                {item.title}
                {item.active && (
                  <div className="absolute -bottom-6 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle - Mobile (Always Visible) */}
            <div className="sm:hidden">
              <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-2 py-1 text-text-secondary hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-border rounded text-xs"
              >
                <Globe className="w-3 h-3" />
                <span className={`font-medium ${language === 'en' ? 'text-blue-600' : ''}`}>EN</span>
                <span className="text-text-meta">|</span>
                <span className={`font-medium ${language === 'so' ? 'text-blue-600' : ''}`}>SO</span>
              </button>
            </div>

            {/* Search - Fully Functional */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-xl z-50">
                  {/* Search Input */}
                  <form onSubmit={handleSearchSubmit} className="p-4 border-b border-border">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('common.search') || 'Search articles...'}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-blue-600"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {/* Search Results */}
                  <div className="max-h-96 overflow-y-auto">
                    {isSearching && (
                      <div className="p-4 text-center text-text-secondary text-sm">
                        {t('articles.searching')}
                      </div>
                    )}
                    
                    {!isSearching && searchQuery && searchResults.length === 0 && (
                      <div className="p-4 text-center text-text-secondary text-sm">
                        {t('articles.search-no-results')} "{searchQuery}"
                      </div>
                    )}
                    
                    {!isSearching && searchResults.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs text-text-meta px-2 py-1 mb-2">
                          {searchResults.length} {searchResults.length === 1 ? t('articles.results-found') : t('articles.results-found-plural')}
                        </div>
                        {searchResults.map((post) => (
                          <Link
                            key={post.slug}
                            to={`/articles/${post.slug}`}
                            onClick={handleResultClick}
                            className="block p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex gap-3">
                              <img 
                                src={post.image} 
                                alt={post.title}
                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                                  {post.title}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                                  {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-red-600 font-medium">
                                    {post.category}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(post.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {!searchQuery && (
                      <div className="p-4 text-center text-text-secondary text-sm">
                        {t('articles.start-typing')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle - Desktop */}
            <div className="hidden sm:block">
              <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-border rounded-lg text-sm"
              >
                <Globe className="w-4 h-4" />
                <span className={`font-medium ${language === 'en' ? 'text-blue-600' : ''}`}>EN</span>
                <span className="text-text-meta">|</span>
                <span className={`font-medium ${language === 'so' ? 'text-blue-600' : ''}`}>SO</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Enhanced Design */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border-light bg-background">
            {/* Mobile Navigation Links */}
            <nav className="py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors rounded-lg mx-2 ${
                    item.active 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-text-secondary hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.title}</span>
                  {item.active && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Mobile Social Media */}
            <div className="px-4 py-3 border-t border-border-light">
              <div className="flex items-center justify-center space-x-6">
                <a
                  href="https://youtube.com/@miftahsom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-text-secondary hover:text-blue-600 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('social.youtube')}</span>
                </a>
                <a
                  href="https://x.com/Miftahsom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-text-secondary hover:text-blue-600 transition-colors"
                >
                  {/* X (Twitter) icon using lucide Twitter glyph as fallback */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2H21l-6.373 7.297L22 22h-6.787l-4.77-6.217L5.8 22H3l6.82-7.817L2 2h6.92l4.31 5.715L18.244 2Zm-1.19 18.286h1.79L7.03 3.643H5.12l11.935 16.643Z"/>
                  </svg>
                  <span className="text-sm font-medium">X</span>
                </a>
                <a
                  href="https://www.facebook.com/miftahsom1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-text-secondary hover:text-blue-600 transition-colors"
                >
                  {/* Facebook */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22 12a10 10 0 1 0-11.563 9.874v-6.985H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562V12h2.773l-.443 2.889h-2.33v6.985A10.002 10.002 0 0 0 22 12Z"/>
                  </svg>
                  <span className="text-sm font-medium">{t('social.facebook')}</span>
                </a>
                <a
                  href="https://www.instagram.com/miftahsom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-text-secondary hover:text-blue-600 transition-colors"
                >
                  {/* Instagram */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2ZM18 6.5a1 1 0 1 1-1-1 1 1 0 0 1 1 1Z"/>
                  </svg>
                  <span className="text-sm font-medium">{t('social.instagram')}</span>
                </a>
                <a
                  href="https://tiktok.com/@miftahsom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-text-secondary hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/>
                  </svg>
                  <span className="text-sm font-medium">{t('social.tiktok')}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;