import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Minimal nav */}
      <nav className="flex items-center justify-between h-14 px-6">
        <button
          onClick={() => navigate("/")}
          className="text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity cursor-pointer"
        >
          hermes
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="h-px w-8 bg-foreground mx-auto mb-6" />
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-foreground">
            404
          </h1>
          <p className="text-sm text-muted-foreground mt-4 mb-8">
            This page does not exist
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Go home
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
