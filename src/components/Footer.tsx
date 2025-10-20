import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const Footer = () => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  
  const toggleSection = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  
  const footerSections = [
    {
      title: t('footer.content'),
      links: [
        { title: t('category.health.title'), href: "/health" },
        { title: t('category.parenting.title'), href: "/parenting" },
        { title: t('category.baby-names.title'), href: "/baby-names" },
        { title: t('category.education.title'), href: "/education" },
        { title: t('category.quran.title'), href: "/quran" }
      ]
    },
    {
      title: t('footer.about-us'), 
      links: [
        { title: t('footer.our-mission'), href: "/about" },
        { title: t('footer.contact-us'), href: "/contact" },
        { title: t('footer.editorial-team'), href: "/team" },
        { title: t('footer.privacy-policy'), href: "/privacy" },
        { title: t('footer.terms-of-service'), href: "/terms" }
      ]
    },
    {
      title: t('footer.resources'),
      links: [
        { title: t('footer.article-archive'), href: "/archive" },
        { title: t('footer.research-library'), href: "/research" },
        { title: t('footer.expert-contributors'), href: "/experts" },
        { title: t('footer.community-guidelines'), href: "/guidelines" },
        { title: t('footer.rss-feeds'), href: "/rss" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Youtube, key: 'youtube', href: "https://www.youtube.com/@miftahsom", label: t('social.youtube') },
    { icon: null as any, key: 'tiktok', href: "https://www.tiktok.com/@miftahsom", label: 'TikTok' },
    { icon: Twitter, key: 'x', href: "https://x.com/Miftahsom", label: 'X' },
    { icon: Facebook, key: 'facebook', href: "https://www.facebook.com/miftahsom1/", label: t('social.facebook') },
    { icon: Instagram, key: 'instagram', href: "https://www.instagram.com/miftahsom", label: t('social.instagram') },
  ];

  return (
    <footer className="bg-background border-t border-border-light">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Company Info - Mobile First */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src="/images/logo.png"
              alt="Miftah Som logo"
              className="w-12 h-12 object-contain rounded-lg shadow-sm"
              loading="lazy"
            />
            <div>
              <h3 className="text-lg font-bold text-foreground">Miftah Som Academy</h3>
              <p className="text-sm text-text-secondary">Health & Education</p>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            {t('footer.description')}
          </p>

          {/* Contact Info - Mobile Optimized */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 text-sm text-text-secondary">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <span>miftahsom@gmail.com</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-secondary">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <span>+252907756127</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-secondary">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <span>Global Online Platform</span>
            </div>
          </div>

          {/* Social Links - Mobile Optimized */}
          <div className="flex space-x-3">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.key || index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-50 hover:bg-blue-50 rounded-lg flex items-center justify-center text-text-secondary hover:text-blue-600 transition-all duration-200"
                >
                  {IconComponent ? (
                    <IconComponent className="w-5 h-5" />
                  ) : (
                    // TikTok icon inline SVG
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/>
                    </svg>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer Sections - Mobile Accordion */}
        <div className="space-y-4 md:hidden">
          {footerSections.map((section, index) => (
            <div key={index} className="border border-border-light rounded-lg">
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <h4 className="font-semibold text-foreground">{section.title}</h4>
                {expandedSections.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                )}
              </button>
              {expandedSections.includes(index) && (
                <div className="px-4 pb-4">
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          to={link.href}
                          className="text-sm text-text-secondary hover:text-blue-600 transition-colors block py-1"
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Footer Sections */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-sm text-text-secondary hover:text-blue-600 transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer - Mobile Optimized */}
      <div className="border-t border-border-light bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <div className="text-sm text-text-secondary text-center md:text-left">
              {t('footer.copyright')}
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
              <Link to="/privacy" className="text-text-secondary hover:text-blue-600 transition-colors">
                {t('footer.privacy-policy')}
              </Link>
              <Link to="/terms" className="text-text-secondary hover:text-blue-600 transition-colors">
                {t('footer.terms-of-service')}
              </Link>
              <Link to="/cookies" className="text-text-secondary hover:text-blue-600 transition-colors">
                {t('footer.cookie-policy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;