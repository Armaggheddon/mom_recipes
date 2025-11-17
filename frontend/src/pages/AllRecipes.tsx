import { useEffect, useState } from "react";
import RecipeApi from "../api/recipe.service";
import type { RecipeTiny } from "../types/recipe";
import RecipeRow from "../components/RecipeRow";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import InfiniteScroll from "react-infinite-scroll-component";

export default function AllRecipes() {
  const [recipes, setRecipes] = useState<RecipeTiny[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQueryResult, setIsQueryResult] = useState(false);
  const [recipeQuery, setRecipeQuery] = useState("");
  const [typeFilters, setTypeFilters] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const recipesPerPage = 20;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await RecipeApi.getRecipes(0, recipesPerPage);
        setRecipes(data);
        setHasMore(data.length >= recipesPerPage);
        setCurrentPage(0);
      } catch (error) {
        console.error("Error fetching initial recipes:", error);
        setError("Failed to load recipes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialRecipes();
  }, []);

  const fetchMoreRecipes = async () => {
    try {
      const nextPage = currentPage + 1;
      const filterValues = Object.values(typeFilters);
      const data = await RecipeApi.getRecipes(nextPage, recipesPerPage, {
        type: filterValues.length ? filterValues : undefined,
        queryString: isQueryResult && recipeQuery ? recipeQuery : undefined,
      });

      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      const newRecipes = [...recipes, ...data];
      setRecipes(newRecipes);
      setCurrentPage(nextPage);
      setHasMore(data.length >= recipesPerPage);
    } catch (error) {
      console.error("Error fetching more recipes:", error);
      setHasMore(false);
    }
  };

  function onItemClick(id: number) {
    navigate(`/recipe/${id}`);
  }

  function resetFilters() {
    setTypeFilters({});
  }

  async function handleOnSearch(
    query: string,
    selectedTypeFilters: { [key: string]: string },
  ) {
    try {
      setIsLoading(true);
      setError(null);
      const filterValues = Object.values(selectedTypeFilters);
      const data = await RecipeApi.getRecipes(0, recipesPerPage, {
        type: filterValues.length ? filterValues : undefined,
        queryString: query || undefined,
      });
      setRecipes(data);
      setIsQueryResult(Boolean(query) || filterValues.length > 0);
      setRecipeQuery(query);
      setTypeFilters(selectedTypeFilters);
      setCurrentPage(0);
      setHasMore(data.length >= recipesPerPage);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setRecipes([]);
      setIsQueryResult(true);
      setCurrentPage(0);
      setHasMore(false);
      setError("Failed to search recipes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function buildSearchDescription() {
    const descriptions: string[] = [];
    if (recipeQuery && recipeQuery.length > 0) {
      descriptions.push(`"${recipeQuery}"`);
    }
    const typeFilterValues = Object.values(typeFilters);
    if (typeFilterValues.length > 0) {
      descriptions.push(`type: ${typeFilterValues.join(", ")}`);
    }
    return descriptions.join(" | ");
  }

  async function handleRefresh() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await RecipeApi.getRecipes(0, recipesPerPage);
      setRecipes(data);
      setIsQueryResult(false);
      setRecipeQuery("");
      resetFilters();
      setCurrentPage(0);
      setHasMore(data.length >= recipesPerPage);
    } catch (error) {
      console.error("Error refreshing recipes:", error);
      setError("Failed to refresh recipes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function refreshButton() {
    return (
      <button
        className="px-4 py-2 bg-surface-container text-primary rounded-full hover:opacity-80"
        onClick={handleRefresh}
      >
        <span className="material-symbols-rounded align-middle">refresh</span>
      </button>
    );
  }

  return (
    <div>
      <div>
        <SearchBar onSearch={handleOnSearch} />
      </div>
      <div>
        {isLoading ? (
          <div className="text-center text-on-surface-variant mt-8">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-2xl">Loading recipes...</div>
          </div>
        ) : error ? (
          <div className="text-center text-on-surface-variant mt-8 space-y-4">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-xl text-error">{error}</div>
            <button
              className="px-6 py-3 bg-primary text-on-primary rounded-full hover:opacity-80"
              onClick={handleRefresh}
            >
              <span className="material-symbols-rounded align-middle mr-2">
                refresh
              </span>
              Retry
            </button>
          </div>
        ) : (
          <>
            {isQueryResult &&
              recipes.length > 0 &&
              (recipeQuery || Object.keys(typeFilters).length > 0) && (
                <div className="flex flex-row items-center mb-4 space-x-2">
                  <div className="flex flex-row align-middle flex-wrap ml-8">
                    <div className="text-on-surface">
                      Found {recipes.length} recipe
                      {recipes.length === 1 ? "" : "s"} for{" "}
                      <span className="font-bold">
                        {buildSearchDescription()}
                      </span>
                    </div>
                  </div>
                  {isQueryResult && refreshButton()}
                </div>
              )}

            {!isQueryResult && recipes.length === 0 ? (
              <div className="text-center text-on-surface-variant mt-8">
                <div className="text-4xl mb-4">📝</div>
                <div>No recipes yet, add one</div>
              </div>
            ) : isQueryResult && recipes.length === 0 ? (
              <div className="flex flex-col justify-center items-stretch">
                <div className="text-center text-on-surface-variant mt-8 space-y-2">
                  <div className="text-4xl mb-4">😔</div>
                  <div>No recipes found</div>
                  {refreshButton()}
                </div>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={recipes.length}
                next={fetchMoreRecipes}
                hasMore={hasMore}
                loader={
                  <div className="text-center text-on-surface-variant mt-4 mb-4">
                    <div className="text-2xl">Loading more recipes...</div>
                  </div>
                }
                endMessage={
                  !isQueryResult && recipes.length > 0 ? (
                    <div className="text-center text-on-surface-variant mt-4 mb-4">
                      <div className="text-lg">You've seen all recipes!</div>
                    </div>
                  ) : null
                }
              >
                {recipes.map((recipe) => (
                  <RecipeRow
                    key={recipe.id}
                    recipe={recipe}
                    onClick={onItemClick}
                  />
                ))}
              </InfiniteScroll>
            )}
          </>
        )}
      </div>
    </div>
  );
}
