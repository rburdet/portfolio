import React, { useState, useEffect, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import Loading from "./Loading";

import "./Autocomplete.css";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

interface SearchResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

const DEBOUNCE_TIME = 500;

const Autocomplete: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listboxRef = useRef<HTMLUListElement>(null);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const data: SearchResponse = await response.json();
      setSuggestions(data.products);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Use the debounced value
  const debouncedQuery = useDebounce(query, DEBOUNCE_TIME);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setActiveIndex(-1);
  };

  const handleSelectProduct = (product: Product) => {
    console.log("Product selected ", product); // TODO: It wasn't ask in the assignment, but it would be nice to show something
    setQuery(product.title);
    setShowSuggestions(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex).filter(e => e);;

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => {
          return prev < suggestions.length - 1 ? prev + 1 : 0;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => {
          return prev > 0 ? prev - 1 : suggestions.length - 1;
        });
        break;
      case "Enter":
        if (activeIndex >= 0) {
          handleSelectProduct(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    //Handling scrolling with keydown
    if (activeIndex >= 0 && listboxRef.current) {
      const activeElement = listboxRef.current.children[
        activeIndex
      ] as HTMLElement;
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="autocomplete-container">
      <div className="input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search products..."
          className="autocomplete-input"
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls="suggestions-listbox"
          aria-labelledby="search-label"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-activedescendant={
            activeIndex >= 0
              ? `suggestion-${suggestions[activeIndex]?.id}`
              : undefined
          }
          onFocus={() => setShowSuggestions(true)}
        />
        {loading && <Loading />}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={listboxRef}
          className="suggestions-list"
          role="listbox"
          aria-label="Product suggestions"
        >
          {suggestions.map((product, index) => (
            <li
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className={`suggestion-item ${index === activeIndex ? "suggestion-item--active" : ""}`}
              role="option"
              aria-selected={index === activeIndex}
              tabIndex={-1}
            >
              <img
                src={product.thumbnail}
                alt={product.title}
                role="presentation"
                className="suggestion-thumbnail"
              />
              <div className="suggestion-details">
                <div className="suggestion-title">
                  {highlightMatch(product.title, query)}
                </div>
                <div className="suggestion-price">${product.price}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
