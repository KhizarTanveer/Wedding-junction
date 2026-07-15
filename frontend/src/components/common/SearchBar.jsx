import { useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    if (onSearch) onSearch(query.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex justify-center mt-12 px-4">
      <div className={`relative w-full max-w-xl transition-all duration-400 ${isFocused ? "scale-[1.02]" : ""}`}>
        {/* Input Field */}
        <input
          type="text"
          placeholder="Search vendors, services, or venues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="
            w-full
            pl-10 sm:pl-14
            pr-20 sm:pr-32
            py-3 sm:py-4
            rounded-full
            shadow-soft
            border border-stone-200
            focus:outline-none
            focus:ring-2 focus:ring-amber-200/50
            focus:border-amber-400/50
            focus:shadow-elegant
            text-slate-800
            placeholder-stone-400
            font-normal
            text-base
            transition-all
            duration-400
            ease-luxury
            bg-white/95
            backdrop-blur-sm
          "
        />

        {/* Search Icon */}
        <svg
          className={`absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isFocused ? "text-orange-500" : "text-stone-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="
            absolute right-1.5 top-1/2 transform -translate-y-1/2
            bg-gradient-to-r from-orange-600 to-orange-700
            text-white
            px-4 sm:px-6 py-2 sm:py-2.5
            rounded-full
            shadow-soft
            hover:from-orange-700 hover:to-orange-800
            hover:shadow-soft-md
            hover:-translate-y-0.5
            active:translate-y-0
            transition-all duration-300 ease-luxury
            font-medium
            text-sm
          "
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
