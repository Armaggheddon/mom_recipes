import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string, typeFilters: { [key: string]: string }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState<string>("");
  const [typeFilters, setTypeFilters] = useState<{ [key: string]: string }>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const recipeTypes = [
    "dessert",
    "main_dish",
    "side_dish",
    "appetizer",
    "beverage",
  ];

  // Debounced search on text input changes
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return; // avoid auto-search on empty

    const handler = setTimeout(() => {
      onSearch(trimmed, typeFilters);
    }, 500);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="w-full mb-6">
      <div className="flex flex-row space-x-3 items-center">
        <input
          type="text"
          placeholder="Search recipes..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearch(query, typeFilters);
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          value={query}
          className="flex-1 px-4 py-3 border bg-surface-container border-surface-variant text-on-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
        />
        <button
          className="px-6 py-3 bg-primary-container text-on-primary-container rounded-full hover:opacity-70 transition duration-200 font-bold flex items-center space-x-2"
          onClick={() => {
            onSearch(query, typeFilters);
          }}
        >
          <span className="material-symbols-rounded">search</span>
          <span className="hidden sm:inline">Search</span>
        </button>
        <button
          className={`p-3 rounded-full transition duration-200 ${
            showFilters || Object.keys(typeFilters).length > 0
              ? "bg-primary text-on-primary"
              : "bg-surface-variant text-on-surface-variant"
          } hover:opacity-70`}
          onClick={() => {
            setShowFilters(!showFilters);
          }}
        >
          <span className="material-symbols-rounded">filter_list</span>
        </button>
      </div>

      {/* selectable chip buttons that display the current filters for type */}
      {showFilters && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {recipeTypes.map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full border cursor-pointer select-none transition duration-200 font-bold ${
                  typeFilters[type]
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-variant text-on-surface-variant border-surface-variant hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container"
                }`}
                onClick={() => {
                  const newFilters = { ...typeFilters };
                  if (newFilters[type]) {
                    delete newFilters[type];
                  } else {
                    newFilters[type] = type;
                  }
                  setTypeFilters(newFilters);
                }}
              >
                {typeFilters[type] && (
                  <span className="material-symbols-rounded align-middle me-1 font-bold">
                    check
                  </span>
                )}
                {type.charAt(0).toUpperCase() +
                  type.slice(1).split("_").join(" ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
