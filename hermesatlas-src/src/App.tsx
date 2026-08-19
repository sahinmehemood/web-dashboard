import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { SearchProvider } from "@/lib/search";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/pages/HomePage";
import { CategoryPage } from "@/pages/CategoryPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { AllProjects } from "@/pages/AllProjects";
import { SearchResults } from "@/pages/SearchResults";

function ScrollToTop() {
  const { pathname } = useLocation();
  window.scrollTo(0, 0);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/project/:owner/:repo" element={<ProjectPage />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <SearchProvider>
      <div className="flex min-h-screen flex-col bg-bg">
        <Header />
        <ScrollToTop />
        <AnimatedRoutes />
        <Footer />
      </div>
    </SearchProvider>
  );
}
