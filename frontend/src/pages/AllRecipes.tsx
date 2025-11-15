import { useEffect, useState } from "react";
import RecipeApi from "../api/recipe.service";
import type { RecipeTiny } from "../types/recipe";
import RecipeRow from "../components/RecipeRow";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import InfiniteScroll from "react-infinite-scroll-component";

export default function AllRecipes() {
  const [allRecipes, setAllRecipes] = useState<RecipeTiny[]>([]);
  const [recipes, setRecipes] = useState<RecipeTiny[]>([]);
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
        const data = await RecipeApi.getRecipes(0, recipesPerPage);
        setAllRecipes(data);
        setRecipes(data);
        setHasMore(data.length >= recipesPerPage);
        setCurrentPage(0);
      } catch (error) {
        console.error("Error fetching initial recipes:", error);
      }
    };

    fetchInitialRecipes();
  }, []);

  const fetchMoreRecipes = async () => {
    try {
      const nextPage = currentPage + 1;
      const data = await RecipeApi.getRecipes(nextPage, recipesPerPage);
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      
      const newRecipes = [...allRecipes, ...data];
      setAllRecipes(newRecipes);
      
      if (!isQueryResult) {
        setRecipes(newRecipes);
      }
      
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
    typeFilters: { [key: string]: string },
  ) {
    // For search/filter, use in-memory filtering on loaded recipes
    const lowerQuery = query.toLowerCase();
    const filteredRecipes = allRecipes.filter((recipe) => {
      const matchesQuery = recipe.name.toLowerCase().includes(lowerQuery);
      const matchesType =
        Object.values(typeFilters).length === 0 ||
        (recipe.type && Object.values(typeFilters).includes(recipe.type));
      return matchesQuery && matchesType;
    });
    setRecipes(filteredRecipes);
    setIsQueryResult(true);
    setRecipeQuery(query);
    setTypeFilters(typeFilters);
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

  function refreshButton() {
    return (
      <button
        className="px-4 py-2 bg-surface-container text-primary rounded-full hover:opacity-80"
        onClick={() => {
          setRecipes(allRecipes);
          setIsQueryResult(false);
          setRecipeQuery("");
          resetFilters();
        }}
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
        {isQueryResult &&
          recipes.length > 0 &&
          (recipeQuery || Object.keys(typeFilters).length > 0) && (
            <div className="flex flex-row items-center mb-4 space-x-2">
              <div className="flex flex-row align-middle flex-wrap ml-8">
                <div className="text-on-surface">
                  Found {recipes.length} recipe{recipes.length === 1 ? "" : "s"}{" "}
                  for{" "}
                  <span className="font-bold">{buildSearchDescription()}</span>
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
            hasMore={!isQueryResult && hasMore}
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
              <RecipeRow key={recipe.id} recipe={recipe} onClick={onItemClick} />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
