import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import Fuse from "fuse.js";
import { PROJECTS, type Project } from "@/data/projects";

interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  results: Project[];
  isSearching: boolean;
}

const SearchContext = createContext<SearchContextValue | null>(null);

const fuse = new Fuse(PROJECTS, {
  keys: [
    { name: "owner", weight: 0.3 },
    { name: "repo", weight: 0.4 },
    { name: "description", weight: 0.2 },
    { name: "category", weight: 0.1 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Project[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const r = fuse.search(query).map((r) => r.item);
    setResults(r);
  }, [query]);

  return (
    <SearchContext.Provider
      value={{ query, setQuery, results, isSearching: query.trim().length > 0 }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
