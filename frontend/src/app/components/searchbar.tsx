"use client";
import React from "react";
import { FaArrowCircleRight } from "react-icons/fa";
import { IconType } from "react-icons";
import { cn } from "@/app/lib/utils";

const SearchBar = ({
  className,
  icon: Icon = FaArrowCircleRight,
  placeholder = "Search",
  onSearch = () => {
    console.log("Search");
  },
}: {
  className?: string;
  icon?: IconType;
  placeholder?: string;
  onSearch?: (search: string) => void;
}) => {
  const [search, setSearch] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  const handleSearch = () => {
    onSearch(search);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-10 bg-zinc-900 rounded-[29px] flex",
        className,
      )}
    >
      <input
        className="w-full px-[5%] bg-transparent outline-none"
        placeholder={placeholder}
        value={search}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
      />
      <button className="absolute inset-y-0 right-[5%]" onClick={handleSearch}>
        <Icon
          className="inset-y-0 right-0 text-gray-400 hover:text-gray-600 w-auto h-1/2"
          size={"50%"}
        />
      </button>
    </div>
  );
};

export default SearchBar;
