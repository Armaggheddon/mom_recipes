import { useState } from "react";

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

  function resetSearchParams() {
    setQuery("");
    setTypeFilters({});
  }

  return (
    <div className="w-full mx-4 p-4">
      <div className=" flex flex-row space-x-4">
        <input
          type="text"
          placeholder="Search recipes..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearch(query, typeFilters);
              resetSearchParams();
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          value={query}
          className="w-full p-2 border bg-surface-container border-outline  text-on-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          className="bg-secondary text-on-secondary h-14 w-14 rounded-full hover:opacity-70"
          onClick={() => {
            onSearch(query, typeFilters);
            resetSearchParams();
          }}
        >
          <span className="material-symbols-rounded">search</span>
        </button>
        <button
          className="bg-tertiary-container text-on-tertiary-container h-14 w-14 rounded-full hover:opacity-70"
          onClick={() => {
            setShowFilters(!showFilters);
          }}
        >
          <span className="material-symbols-rounded scale-110">
            filter_list
          </span>
        </button>
      </div>

      {/* selectable chip buttons that display the current filters for type */}
      {showFilters && (
        <div>
          <div className="flex flex-wrap py-2">
            {recipeTypes.map((type) => (
              <div
                key={type}
                className={`m-1 px-4 py-2 rounded-full border cursor-pointer select-none 
								${typeFilters[type] ? "bg-primary text-on-primary border-primary font-bold" : "bg-surface-variant text-on-surface-variant border-outline"}`}
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
                {/* If is selected show a check icon */}
                {typeFilters[type] && (
                  <span className="material-symbols-rounded align-middle me-2">
                    check
                  </span>
                )}
                {type.charAt(0).toUpperCase() +
                  type.slice(1).split("_").join(" ")}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
