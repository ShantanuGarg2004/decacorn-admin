"use client";

import { useState } from "react";

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  return (
    <input
      type="text"
      placeholder="Search leads..."
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
      }}
      className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
    />
  );
}
