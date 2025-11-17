import type { RecipeTiny } from "../types/recipe";
import RecipeCard from "./RecipeCard";

interface GridItemsProps {
  recipes: RecipeTiny[];
  onItemClick: (id: number) => void;
  onNewRecipeClick: () => void;
}

export default function GridItems({
  recipes,
  onItemClick,
  onNewRecipeClick = () => {},
}: GridItemsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2 pb-8 md:mx-8">
      {recipes.length === 0 ? (
        <div className="col-span-full flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center">
            <p className="text-on-background">
              🔍 It looks like you haven't added any recipes yet.
            </p>
            <p className="text-on-background mb-2">Try adding a new recipe!</p>
            <button
              className="px-4 py-2 bg-primary text-on-primary rounded-full hover:bg-opacity-70 transition"
              onClick={onNewRecipeClick}
            >
              + New Recipe
            </button>
          </div>
        </div>
      ) : (
        recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} onClick={onItemClick} />
        ))
      )}
    </div>
  );
}
