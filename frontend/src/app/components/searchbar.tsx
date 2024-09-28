"use client";
import React from "react";
import {cn} from "@/app/lib/utils";

const SearchBar = ({ className, placeholder = "Search" }: { className?: string, placeholder?: string }) => {
  const [search, setSearch] = React.useState("");

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <div className={cn("w-full h-10 bg-zinc-900 rounded-[29px] flex", className)}>
      <input
        className="w-full px-4 bg-transparent outline-none z-20"
        placeholder={placeholder}
        value={search}
        onChange={handleSearch}
      />
    </div>
  );
};

export default SearchBar;