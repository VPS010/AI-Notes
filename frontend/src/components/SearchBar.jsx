import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const SearchBar = ({ onSearch, onSort, sortOrder }) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="flex-1 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
          // Call onSearch with the input value
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <button
        className="px-4 py-2 flex items-center text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-full"
        // Toggle sort order between ascending and descending
        onClick={() => onSort(sortOrder === "desc" ? "asc" : "desc")}
      >
        <SlidersHorizontal size={17} className="mr-2" />
        Sort {sortOrder === "desc" ? "Oldest First" : "Newest First"}
      </button>
    </div>
  );
};

export default SearchBar;
