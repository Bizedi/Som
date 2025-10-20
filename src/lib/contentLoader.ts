// Content loader for Netlify CMS
export interface BlogPost {
  title: string;
  date: string;
  image: string;
  category: string;
  excerpt: string;
  author: string;
  readTime: string;
  language: string;
  slug: string;
  body: string;
}

export interface Category {
  title: string;
  description: string;
  image: string;
  color: string;
  slug: string;
}

export interface HomePage {
  title: string;
  description: string;
  heroTitle: string;
  heroExcerpt: string;
  heroImage: string;
}

// In a real implementation, you would fetch this from your CMS API
// For now, we'll use the static content we created
export const loadBlogPosts = async (language: string = 'en'): Promise<BlogPost[]> => {
  // Always prefer the generated feed to ensure translated duplicates are used consistently
  return await loadPostsFromJson(language);
};

// Fallback function to load posts from the generated posts.json file
const loadPostsFromJson = async (language: string = 'en'): Promise<BlogPost[]> => {
  try {
    console.log("Loading posts from posts.json...");
    console.log("Current URL:", window.location.href);
    console.log("Fetching from:", "/posts.json");
    
    const response = await fetch("/posts.json");
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts.json: ${response.status} ${response.statusText}`);
    }
    
    const postsData = await response.json();
    console.log("Successfully loaded", postsData.length, "posts from posts.json");
    console.log("First post:", postsData[0]);
    
    // Convert the JSON data to BlogPost format
    const posts: BlogPost[] = postsData.map((post: any) => ({
      title: post.title,
      date: post.date,
      image: post.image,
      category: post.category,
      excerpt: post.excerpt,
      author: post.author,
      readTime: post.readTime,
      language: post.language,
      slug: post.slug,
      body: post.html // The JSON contains 'html' instead of 'body'
    }));
    
    console.log("Converted posts:", posts.length);
    
    // Filter posts by language
    const filteredPosts = posts.filter(post => post.language === language);
    console.log(`Filtered to ${filteredPosts.length} posts for language: ${language}`);
    
    return filteredPosts;
  } catch (error) {
    console.error("Error loading posts from posts.json:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Return empty array as final fallback
    return [];
  }
};

export const loadCategories = async (): Promise<Category[]> => {
  return [
    {
      title: "Health",
      description: "Comprehensive health information, nutrition guidance, and wellness tips for the whole family.",
      image: "/images/hero-health-nutrition.jpg",
      color: "#10B981",
      slug: "health"
    },
    {
      title: "Parenting",
      description: "Expert guidance for raising healthy, happy children with Islamic values and modern parenting wisdom.",
      image: "/images/hero-parenting.jpg",
      color: "#8B5CF6",
      slug: "parenting"
    },
    {
      title: "Baby Names",
      description: "Beautiful Somali, Arabic, and Islamic names with meaningful origins and cultural significance.",
      image: "/images/hero-baby-names.jpg",
      color: "#EC4899",
      slug: "baby-names"
    },
    {
      title: "Education",
      description: "Educational insights, learning strategies, and academic guidance for students and families.",
      image: "/images/hero-education.jpg",
      color: "#3B82F6",
      slug: "education"
    },
    {
      title: "Quran Studies",
      description: "Islamic education, Quranic studies, and spiritual guidance for modern Muslim families.",
      image: "/images/hero-quran.jpg",
      color: "#10B981",
      slug: "quran"
    }
  ];
};

export const loadHomePage = async (): Promise<HomePage> => {
  return {
    title: "Miftah Som Academy - Health, Parenting, Education & Islamic Studies",
    description: "Empowering families with knowledge about health, parenting, education, and Islamic values through evidence-based content and cultural wisdom.",
    heroTitle: "Essential Nutrition Guide: Building Healthy Eating Habits for the Whole Family",
    heroExcerpt: "Discover comprehensive strategies for maintaining optimal health through balanced nutrition, including practical meal planning tips and evidence-based dietary recommendations that work for busy families.",
    heroImage: "/images/hero-health-nutrition.jpg"
  };
};
