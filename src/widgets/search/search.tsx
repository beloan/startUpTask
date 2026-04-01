// SearchBar.tsx
"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { SearchSuggestions } from "@/feature/search-suggestions/ui/search-suggestions";

import { Input } from "@/shared/ui/kit/input";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveSearchToHistory = (query: string) => {
    if (!query.trim() || typeof window === "undefined") return;

    const savedHistory = localStorage.getItem("searchHistory");
    let history: string[] = [];

    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (error) {
        console.error("Ошибка загрузки истории поиска:", error);
      }
    }

    const updatedHistory = [
      query,
      ...history.filter((item) => item.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 10);

    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      saveSearchToHistory(searchTerm.trim());

      setIsExpanded(false);
      setShowSuggestions(false);
      router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsExpanded(false);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && searchQuery.trim()) {
      saveSearchToHistory(searchQuery.trim());
      performSearch();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
    setShowSuggestions(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleCloseSuggestions = () => {
    setIsExpanded(false);
    setShowSuggestions(false);
  };

  const handleSelect = () => {
    setIsExpanded(false);
    setShowSuggestions(false);
  };

  const handleSuggestionSearch = (query: string) => {
    setSearchQuery(query);
    saveSearchToHistory(query);
    performSearch(query);
  };

  const handleSearchButtonClick = () => {
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery.trim());
    }
    performSearch();
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-4">
      <form
        onSubmit={handleSearchSubmit}
        className="relative rounded-md border-2 border-blue-500 bg-blue-500"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10 cursor-pointer" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="pl-10 pr-10 w-5/6 rounded-[6px] bg-white focus-visible:border-1 focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:outline-none"
        />
        <button
          type="button"
          onClick={handleSearchButtonClick}
          className="bg-blue-500 text-white rounded-l-sm hover:bg-blue-600 transition-colors inline absolute bottom-0 right-0 w-20 h-9 cursor-pointer"
        >
          Найти
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-23 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
          >
            <X className="w-4 h-4 cursor-pointer block" />
          </button>
        )}
      </form>

      {showSuggestions && (
        <div className="absolute left-[-5rem] mt-1 z-50 w-2xl shadow-xl rounded-lg overflow-hidden">
          <div className="bg-white rounded-md w-2xl shadow-lg ring ring-gray-100">
            <SearchSuggestions
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearchSubmit={() => performSearch()}
              onClose={handleCloseSuggestions}
              onSelect={handleSelect}
              onSuggestionSearch={handleSuggestionSearch}
            />
          </div>
        </div>
      )}
    </div>
  );
};
