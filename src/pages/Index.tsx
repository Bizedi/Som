import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import ArticleGrid from '@/components/ArticleGrid';
import Sidebar from '@/components/Sidebar';

const Index = () => {
  return (
    <Layout>
      {/* Page Title - Hidden visually but important for SEO */}
      <div className="sr-only">
        <h1>Miftah Som Academy - Health, Parenting, Education &amp; Islamic Studies</h1>
      </div>

      {/* Mobile Layout - Al Jazeera Style */}
      <div className="lg:hidden">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Main Articles */}
        <ArticleGrid />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Hero Section - Exact Al Jazeera Layout */}
        <HeroSection />

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex gap-8">
            {/* Main Articles Grid */}
            <div className="flex-1">
              <ArticleGrid />
            </div>

            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden xl:block">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
