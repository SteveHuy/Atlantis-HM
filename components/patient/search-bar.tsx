"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ArrowDown, ArrowUp } from "lucide-react";
import { dashboardFeatures } from "@/lib/mockDashboardData";
import { dashboardLogger } from "@/lib/logger";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  requirementRef: string;
}

interface SearchBarProps {
  onFeatureSelect?: (featureId: string) => void;
}

export function SearchBar({ onFeatureSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fuzzy search function
  const fuzzySearch = (query: string, text: string): boolean => {
    const queryChars = query.toLowerCase().split('');
    const textChars = text.toLowerCase().split('');
    let queryIndex = 0;
    
    for (let i = 0; i < textChars.length && queryIndex < queryChars.length; i++) {
      if (textChars[i] === queryChars[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === queryChars.length;
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults = dashboardFeatures.filter(feature => 
      fuzzySearch(query, feature.title) || 
      fuzzySearch(query, feature.description)
    );

    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
    setSelectedIndex(-1);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    dashboardLogger.logDashboardEvent('search_result_selected', {
      query,
      selectedFeature: result.title,
      requirementRef: result.requirementRef
    });

    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onFeatureSelect) {
      onFeatureSelect(result.id);
    } else {
      // Default behavior - show placeholder alert
      alert(`UD-REF: ${result.requirementRef} - will be implemented in future epic`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      dashboardLogger.logDashboardEvent('dashboard_search', { query: value });
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search dashboard features..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4"
          aria-label="Search dashboard features"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto"
        >
          <div role="listbox" className="py-2">
            {results.map((result, index) => (
              <div
                key={result.id}
                role="option"
                aria-selected={index === selectedIndex}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 text-blue-900' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleResultSelect(result)}
              >
                <div className="font-medium text-sm">{result.title}</div>
                <div className="text-xs text-gray-600 mt-1 truncate">
                  {result.description}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isOpen && results.length === 0 && query.trim().length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No features found for &quot;{query}&quot;
          </div>
        </Card>
      )}

      {/* Keyboard navigation hint */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-40 text-xs text-gray-500 flex justify-center space-x-4 bg-white py-1">
          <span className="flex items-center space-x-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
            <span>Navigate</span>
          </span>
          <span>Enter to select</span>
          <span>Esc to close</span>
        </div>
      )}
    </div>
  );
}