import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TranslationProvider } from "@/contexts/TranslationContext";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from "./pages/ArticlePage";
import Page from "./pages/Page";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TranslationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/health" element={<CategoryPage />} />
          <Route path="/parenting" element={<CategoryPage />} />
          <Route path="/baby-names" element={<CategoryPage />} />
          <Route path="/education" element={<CategoryPage />} />
          <Route path="/quran" element={<CategoryPage />} />
          <Route path="/categories/:category" element={<CategoryPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          {/* Page routes */}
          <Route path="/about" element={<Page />} />
          <Route path="/contact" element={<Page />} />
          <Route path="/privacy" element={<Page />} />
          <Route path="/terms" element={<Page />} />
          <Route path="/cookies" element={<Page />} />
          <Route path="/team" element={<Page />} />
          <Route path="/archive" element={<Page />} />
          <Route path="/research" element={<Page />} />
          <Route path="/experts" element={<Page />} />
          <Route path="/guidelines" element={<Page />} />
          <Route path="/rss" element={<Page />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TranslationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
