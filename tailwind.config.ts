import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* Al Jazeera Health clone color system */
        'aljazeera': {
          'blue': "hsl(var(--aljazeera-blue))",
          'blue-dark': "hsl(var(--aljazeera-blue-dark))",
          'blue-light': "hsl(var(--aljazeera-blue-light))",
        },
        'text': {
          'primary': "hsl(var(--foreground))",
          'secondary': "hsl(var(--text-secondary))",
          'meta': "hsl(var(--text-meta))",
        },
        'category': {
          'health': "hsl(var(--category-health))",
          'parenting': "hsl(var(--category-parenting))",
          'education': "hsl(var(--category-education))",
          'quran': "hsl(var(--category-quran))",
          'baby-names': "hsl(var(--category-baby-names))",
        },
        border: "hsl(var(--border))",
        'border-light': "hsl(var(--border-light))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          border: "hsl(var(--card-border))",
          hover: "hsl(var(--card-hover))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      /* Al Jazeera typography scale */
      fontSize: {
        'hero-title': ['var(--text-hero-title)', { lineHeight: '1.2', fontWeight: '700' }],
        'article-title': ['var(--text-article-title)', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['var(--text-card-title)', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['var(--text-body)', { lineHeight: '1.6' }],
        'meta': ['var(--text-meta)', { lineHeight: '1.4' }],
        'small': ['var(--text-small)', { lineHeight: '1.4' }],
      },
      /* Layout dimensions */
      height: {
        'header': 'var(--header-height)',
        'hero': 'var(--hero-height)',
      },
      spacing: {
        'header': 'var(--header-height)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        'large': 'var(--radius-large)',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
