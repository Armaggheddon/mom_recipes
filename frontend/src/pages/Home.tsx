import GridItems from "../components/GridItems";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RecipeApi from "../api/recipe.service";
import type { RecipeTiny } from "../types/recipe";

export default function Home() {
  const navigate = useNavigate();

  const [featuredRecipes, setFeaturedRecipes] = useState<RecipeTiny[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const recipes = await RecipeApi.getLatestRecipes();
        setFeaturedRecipes(recipes);
      } catch (error) {
        console.error("Error fetching featured recipes:", error);
        setError("Failed to load recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRecipes();
  }, []);

  function onItemClick(id: number) {
    navigate(`/recipe/${id}`);
  }

  function onNewRecipeClick() {
    navigate("/new");
  }

  function onFeelingLuckyClick() {
    RecipeApi.getFeelingLuckyRecipeId()
      .then((id) => {
        if (id) {
          navigate(`/recipe/${id}`);
        }
      })
      .catch((error) => {
        console.error("Error fetching feeling lucky recipe ID:", error);
      });
  }

  // Loading state
  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-on-background">Loading recipes...</p>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-on-background">{error}</p>
      </main>
    );
  }

  // Empty state
  if (featuredRecipes.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-on-background">
          Nothing to cook here yet 😔
        </p>
        <button
          onClick={onNewRecipeClick}
          className="flex px-6 py-3 bg-primary-container text-on-primary-container rounded-full hover:bg-opacity-90 transition-all"
        >
          <span className="material-symbols-rounded">chef_hat</span>
          <span className="ml-2 font-semibold">Add Your First Recipe</span>
        </button>
      </main>
    );
  }

  // Data loaded successfully
  return (
    <main>
      <GridItems
        recipes={featuredRecipes}
        onItemClick={onItemClick}
        onNewRecipeClick={onNewRecipeClick}
      />
      {featuredRecipes.length > 6 && (
        <div className="flex justify-center mb-4">
          <button onClick={onFeelingLuckyClick}>
            <span className="underline font-semibold text-on-background">
              I'm Feeling Lucky 🍀
            </span>
          </button>
        </div>
      )}
    </main>
  );
}
