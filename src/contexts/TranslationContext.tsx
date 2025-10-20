import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface TranslationContextType {
  language: string;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

interface TranslationProviderProps {
  children: ReactNode;
}

const translations = {
  en: {
    // Navigation
    'nav.health': 'Health',
    'nav.parenting': 'Parenting',
    'nav.baby-names': 'Baby Names',
    'nav.education': 'Education',
    'nav.quran': 'Quran',
    
    // Common
    'common.search': 'Search articles...',
    'common.switch-to-somali': 'Switch to Somali',
    'common.switch-to-english': 'Switch to English',
    'common.subscribe': 'Subscribe',
    'common.email-placeholder': 'Enter your email',
    'common.popular-articles': 'Popular Articles',
    'common.categories': 'Categories',
    'common.stay-updated': 'Stay Updated',
    'common.newsletter-description': 'Get the latest health, parenting, and educational insights delivered to your inbox.',
    
    // Hero Section
    'hero.main-title': 'Essential Nutrition Guide: Building Healthy Eating Habits for the Whole Family',
    'hero.main-excerpt': 'Discover comprehensive strategies for maintaining optimal health through balanced nutrition, including practical meal planning tips and evidence-based dietary recommendations that work for busy families.',
    'hero.side1-title': 'Modern Parenting: Balancing Work and Family Life',
    'hero.side1-excerpt': 'Expert insights on creating harmony between professional responsibilities and quality family time.',
    'hero.side2-title': 'Understanding Quranic Values in Daily Life',
    'hero.side2-excerpt': 'How Islamic teachings can guide contemporary decision-making and personal development.',
    
    // Article Grid
    'articles.somali-baby-names': 'Somali Baby Names: Cultural Heritage and Beautiful Meanings',
    'articles.somali-baby-names-excerpt': 'Explore traditional Somali names for children, their cultural significance, and the beautiful meanings behind popular choices for modern families.',
    'articles.work-life-balance': 'Top 10 Countries for Work-Life Balance in 2025',
    'articles.work-life-balance-excerpt': 'Comprehensive analysis of nations that prioritize employee well-being, family time, and sustainable career growth.',
    'articles.islamic-values': 'Teaching Children About Islamic Values at Home',
    'articles.islamic-values-excerpt': 'Practical approaches for parents to incorporate Islamic teachings and moral values into everyday family routines.',
    'articles.healthy-breakfast': 'Healthy Breakfast Ideas for Growing Children',
    'articles.healthy-breakfast-excerpt': 'Nutritious, delicious morning meal options that fuel your child\'s day with energy and essential nutrients.',
    'articles.positive-discipline': 'Positive Discipline Techniques for Toddlers',
    'articles.positive-discipline-excerpt': 'Evidence-based strategies for guiding young children\'s behavior with patience, consistency, and love.',
    'articles.educational-activities': 'Educational Activities for Preschoolers at Home',
    'articles.educational-activities-excerpt': 'Creative learning games and activities that prepare young children for school while having fun.',
    'articles.arabic-names-girls': 'Choosing Meaningful Arabic Names for Girls',
    'articles.arabic-names-girls-excerpt': 'Beautiful Arabic female names with deep spiritual and cultural significance for Muslim families.',
    'articles.mental-health-parenting': 'Mental Health and Parenting: Finding Balance',
    'articles.mental-health-parenting-excerpt': 'How parents can maintain their own well-being while providing the best care for their children.',
    'articles.quran-memorization': 'Quran Memorization Tips for Children',
    'articles.quran-memorization-excerpt': 'Gentle, effective methods to help young learners memorize Quranic verses with understanding and joy.',
    'articles.immune-systems': 'Building Strong Immune Systems Naturally',
    'articles.immune-systems-excerpt': 'Natural approaches to boosting your family\'s immunity through diet, exercise, and healthy lifestyle choices.',
    'articles.stem-education': 'STEM Education: Preparing Children for the Future',
    'articles.stem-education-excerpt': 'How to nurture science, technology, engineering, and math skills in children from an early age.',
    'articles.traditional-somali-names': 'Traditional Somali Names with Modern Appeal',
    'articles.traditional-somali-names-excerpt': 'Classic Somali names that remain beautiful and relevant for today\'s generation of parents.',
    
    // Sidebar
    'sidebar.popular-posts': 'Popular Articles',
    'sidebar.essential-parenting': 'Essential Parenting Tips for New Parents',
    'sidebar.islamic-names': 'Beautiful Islamic Names and Their Meanings',
    'sidebar.daily-quran': 'Daily Quran Reading: Building Spiritual Habits',
    
    // Footer
    'footer.content': 'Content',
    'footer.about-us': 'About Us',
    'footer.resources': 'Resources',
    'footer.our-mission': 'Our Mission',
    'footer.contact-us': 'Contact Us',
    'footer.editorial-team': 'Editorial Team',
    'footer.privacy-policy': 'Privacy Policy',
    'footer.terms-of-service': 'Terms of Service',
    'footer.article-archive': 'Article Archive',
    'footer.research-library': 'Research Library',
    'footer.expert-contributors': 'Expert Contributors',
    'footer.community-guidelines': 'Community Guidelines',
    'footer.rss-feeds': 'RSS Feeds',
    'footer.description': 'Empowering families with knowledge about health, parenting, education, and Islamic values through evidence-based content and cultural wisdom.',
    'footer.copyright': '© 2025 Miftah Som Academy. All rights reserved.',
    'footer.cookie-policy': 'Cookie Policy',
    
    // Social Media
    'social.facebook': 'Facebook',
    'social.twitter': 'Twitter', 
    'social.instagram': 'Instagram',
    'social.youtube': 'YouTube',
    'social.tiktok': 'TikTok',
    
    // Article Grid & Hero Section
    'articles.latest': 'Latest Articles',
    'articles.more': 'More Articles',
    'articles.view-all': 'View All',
    'articles.loading': 'Loading articles...',
    'articles.not-found': 'No articles found.',
    'articles.search-no-results': 'No articles found for',
    'articles.searching': 'Searching...',
    'articles.results-found': 'result found',
    'articles.results-found-plural': 'results found',
    'articles.start-typing': 'Start typing to search articles...',
    
    // Article Page
    'article.not-found': 'Article not found',
    'article.not-found-desc': 'The article you are looking for may have been moved or unpublished.',
    'article.author': 'Author',
    'article.share': 'Share',
    'article.author-bio': 'Expert contributor with years of experience in health, parenting, and education.',
    'article.related-articles': 'Related Articles',
    
    // Categories
    'category.health.title': 'Health',
    'category.health.description': 'Comprehensive health information, nutrition guidance, and wellness tips for the whole family.',
    'category.parenting.title': 'Parenting',
    'category.parenting.description': 'Expert guidance for raising healthy, happy children with Islamic values and modern parenting wisdom.',
    'category.baby-names.title': 'Baby Names',
    'category.baby-names.description': 'Beautiful Somali, Arabic, and Islamic names with meaningful origins and cultural significance.',
    'category.education.title': 'Education',
    'category.education.description': 'Educational insights, learning strategies, and academic guidance for students and families.',
    'category.quran.title': 'Quran Studies',
    'category.quran.description': 'Islamic education, Quranic studies, and spiritual guidance for modern Muslim families.',
  },
  so: {
    // Navigation
    'nav.health': 'Caafimaad',
    'nav.parenting': 'Barbaarinta Carruurta',
    'nav.baby-names': 'Magacyada Carruurta',
    'nav.education': 'Waxbarasho',
    'nav.quran': 'Quraanka',
    
    // Common
    'common.search': 'Raadi maqaallo...',
    'common.switch-to-somali': 'U bedel Soomaali',
    'common.switch-to-english': 'U bedel Ingiriis',
    'common.subscribe': 'Qor',
    'common.email-placeholder': 'Geli iimaylkaaga',
    'common.popular-articles': 'Maqaallo Caanka ah',
    'common.categories': 'Qaybaha',
    'common.stay-updated': 'La soco',
    'common.newsletter-description': 'Hel macluumaadka ugu dambeeya ee caafimaadka, barbaarinta, iyo waxbarashada oo la soo dirayo sanduuqaaga.',
    
    // Hero Section
    'hero.main-title': 'Hagaha Caafimaadka: Dhiska Caadada Cuntada Caafimaadka ee Qoyska',
    'hero.main-excerpt': 'Hel istiraatiijiyooyin dhamaystiran oo loogu talagalay ilaalinta caafimaadka si fiican, oo ay ku jiraan talooyin ku saabsan qorshaynta cuntada iyo talooyin ku salaysan xogta.',
    'hero.side1-title': 'Barbaarinta Casriga ah: Dhexdhexaadka Shaqada iyo Nolosha Qoyska',
    'hero.side1-excerpt': 'Aragtiyada takhasuusi ah oo ku saabsan dhiska dhexdhexaadka mas\'uuliyadaha shaqada iyo waqtiga qoyska.',
    'hero.side2-title': 'Fahamka Qiyamka Quraanka ee Nolosha Maalinle',
    'hero.side2-excerpt': 'Sida casharada Islaamka ay u hogaamin karaan go\'aamada casriga ah iyo horumarinta shakhsiyaadka.',
    
    // Article Grid
    'articles.somali-baby-names': 'Magacyada Soomaaliga: Dhaqanka iyo Macnaha Quruxda',
    'articles.somali-baby-names-excerpt': 'Baadi magacyada dhaqanka ah ee carruurta, muhiimadda dhaqameedka, iyo macnaha quruxda ee doorashooyinka caanka ah ee qoysaska casriga ah.',
    'articles.work-life-balance': '10 Dal oo ugu Fiican Dhexdhexaadka Shaqada iyo Nolosha 2025',
    'articles.work-life-balance-excerpt': 'Baadi dhamaystiran oo ku saabsan dalalka ay muhiim u tahay wanaagga shaqaalaha, waqtiga qoyska, iyo horumarinta shaqooyinka.',
    'articles.islamic-values': 'Barista Carruurta Qiyamka Islaamka Guri',
    'articles.islamic-values-excerpt': 'Hababka dhaqanka ah oo loogu talagalay waalidiinta inay ku daraan casharada Islaamka iyo qiyamka dhaqanka nolosha qoyska maalinle.',
    'articles.healthy-breakfast': 'Fikradaha Cuntada Subaxda ee Carruurta',
    'articles.healthy-breakfast-excerpt': 'Doorashooyin cunto oo nafaqo leh, oo dhadhami fiican, oo carruurta u siinaya tamar iyo nafaqo muhiim ah.',
    'articles.positive-discipline': 'Hababka Barbaarinta Wanaagsan ee Carruurta',
    'articles.positive-discipline-excerpt': 'Istiraatiijiyooyin ku salaysan xogta oo loogu talagalay hogaaminta dhaqanka carruurta yar oo leh samir, isku duubnaan, iyo jacayl.',
    'articles.educational-activities': 'Dhaqdhaqaaqyada Waxbarashada ee Carruurta Guri',
    'articles.educational-activities-excerpt': 'Ciyaaraha barashada iyo dhaqdhaqaaqyada oo carruurta yar u diyaarisa dugsiyada iyagoo raaxaysanaya.',
    'articles.arabic-names-girls': 'Doorashada Magacyada Carabi ee Macno leh ee Gabdhaha',
    'articles.arabic-names-girls-excerpt': 'Magacyo qurux badan oo gabdho ah oo Carabi ah oo leh muhiimad ruuxi iyo dhaqameed oo qoysaska Muslimka ah.',
    'articles.mental-health-parenting': 'Caafimaadka Maskaxda iyo Barbaarinta: Helitaanka Dhexdhexaadka',
    'articles.mental-health-parenting-excerpt': 'Sida waalidiinta ay u ilaali karaan wanaagga nafahooda iyagoo siinaya daryeelka ugu fiican carruurtooda.',
    'articles.quran-memorization': 'Talooyinka Xusuusta Quraanka ee Carruurta',
    'articles.quran-memorization-excerpt': 'Habab naxariis ah, oo waxtar leh oo carruurta yar u caawiya xusuusta aayadaha Quraanka iyagoo fahamaya iyo farxad.',
    'articles.immune-systems': 'Dhiska Nidaamka Difaaca Si Dabiici ah',
    'articles.immune-systems-excerpt': 'Hababka dabiiciga ah oo loogu talagalay kor u qaadista difaaca qoyskaaga iyadoo la adeegsanayo cunto, jimicsi, iyo doorashooyin nololeed caafimaad qaba.',
    'articles.stem-education': 'Waxbarashada STEM: Diyaarinta Carruurta Mustaqbalka',
    'articles.stem-education-excerpt': 'Sida loo dhiso awoodaha sayniska, teknoolajiyada, injineernimada, iyo xisaabta carruurta laga bilaabo yar.',
    'articles.traditional-somali-names': 'Magacyada Soomaaliga Dhaqanka oo leh Qiimaha Casriga ah',
    'articles.traditional-somali-names-excerpt': 'Magacyo Soomaali oo dhaqanka ah oo weli qurux badan oo muhiim ah jiilka waalidiinta casriga ah.',
    
    // Sidebar
    'sidebar.popular-posts': 'Maqaallo Caanka ah',
    'sidebar.essential-parenting': 'Talooyinka Barbaarinta ee Waalidiinta Cusub',
    'sidebar.islamic-names': 'Magacyada Islaamka Quruxda iyo Macnaha',
    'sidebar.daily-quran': 'Akhriska Quraanka Maalinle: Dhiska Caadada Ruuxiga',
    
    // Footer
    'footer.content': 'Waxyaabaha',
    'footer.about-us': 'Ku saabsan',
    'footer.resources': 'Khayraadka',
    'footer.our-mission': 'Ujeeddadeena',
    'footer.contact-us': 'La soo xidhiidh',
    'footer.editorial-team': 'Kooxda Wax qorista',
    'footer.privacy-policy': 'Siyaasadda Sirta',
    'footer.terms-of-service': 'Shuruudaha Adeegga',
    'footer.article-archive': 'Kaydka Maqaallada',
    'footer.research-library': 'Maktabadda Baadhista',
    'footer.expert-contributors': 'Kuwa ka qayb qaata',
    'footer.community-guidelines': 'Hagaha Bulshada',
    'footer.rss-feeds': 'RSS Feeds',
    'footer.description': 'Siinaya awood qoysaska macluumaad ku saabsan caafimaadka, barbaarinta, waxbarashada, iyo qiyamka Islaamka iyadoo la adeegsanayo waxyaabaha ku salaysan xogta iyo xigmadda dhaqanka.',
    'footer.copyright': '© 2025 Miftah Som Academy. Dhammaan xuquuqda way dhowran yihiin.',
    'footer.cookie-policy': 'Siyaasadda Cookies',
    
    // Social Media
    'social.facebook': 'Facebook',
    'social.twitter': 'Twitter',
    'social.instagram': 'Instagram', 
    'social.youtube': 'YouTube',
    'social.tiktok': 'TikTok',
    
    // Article Grid & Hero Section
    'articles.latest': 'Maqaallo Cusub',
    'articles.more': 'Maqaallo Dheeraad ah',
    'articles.view-all': 'Dhammaan',
    'articles.loading': 'Maqaallo la soo gelinayo...',
    'articles.not-found': 'Maqaal lama helin.',
    'articles.search-no-results': 'Maqaal lama helin',
    'articles.searching': 'Raadinta...',
    'articles.results-found': 'natiijo la helay',
    'articles.results-found-plural': 'natiijooyin la helay',
    'articles.start-typing': 'Bilow qorista si aad u raadiso maqaallo...',
    
    // Article Page
    'article.not-found': 'Maqaal lama helin',
    'article.not-found-desc': 'Maqaalka aad raadineysid waa laga saari karaa ama lama daabici karo.',
    'article.author': 'Qoraaga',
    'article.share': 'Wadaag',
    'article.author-bio': 'Kuwa ka qayb qaata takhasuusi ah oo leh khibrad dheeraad ah oo ku saabsan caafimaadka, barbaarinta, iyo waxbarashada.',
    'article.related-articles': 'Maqaallo La Xidhiidha',
    
    // Categories
    'category.health.title': 'Caafimaad',
    'category.health.description': 'Macluumaad dhamaystiran oo ku saabsan caafimaadka, hagista cuntada, iyo talooyinka caafimaadka qoyska oo dhan.',
    'category.parenting.title': 'Barbaarinta Carruurta',
    'category.parenting.description': 'Hagitaan takhasuusi ah oo loogu talagalay barbaarinta carruur caafimaad qaba oo faraxsan oo leh qiyam Islaam ah iyo xigmadda barbaarinta casriga ah.',
    'category.baby-names.title': 'Magacyada Carruurta',
    'category.baby-names.description': 'Magacyo qurux badan oo Soomaali, Carabi, iyo Islaam ah oo leh asalo macno leh iyo muhiimad dhaqameed.',
    'category.education.title': 'Waxbarasho',
    'category.education.description': 'Aragtiyada waxbarasho, istiraatiijiyooyinka barashada, iyo hagitaanka akadeemiga ah ee ardayda iyo qoysaska.',
    'category.quran.title': 'Daraasaadka Quraanka',
    'category.quran.description': 'Waxbarashada Islaamka, daraasaadka Quraanka, iyo hagitaanka ruuxiga ah ee qoysaska Muslimka ah ee casriga ah.',
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'so' : 'en');
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[language as keyof typeof translations]?.[key as keyof typeof translations.en];
    if (translation) {
      return translation;
    }
    // Fallback to English if translation not found
    const englishTranslation = translations.en[key as keyof typeof translations.en];
    if (englishTranslation) {
      return englishTranslation;
    }
    // Last resort: return a formatted version of the key
    return key.replace(/\./g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    toggleLanguage,
    t
  }), [language, toggleLanguage, t]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    console.error('useTranslation must be used within a TranslationProvider');
    // Return a fallback context to prevent crashes
    return {
      language: 'en',
      toggleLanguage: () => {},
      t: (key: string) => key
    };
  }
  return context;
};

// For better HMR compatibility
export default useTranslation;