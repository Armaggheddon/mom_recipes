import type { RecipeTiny } from "../types/recipe";
import { minute2Text } from "../utils/utils";
import Chip from "./Chip";

interface RecipeCardProps {
  recipe: RecipeTiny;
  onClick: (id: number) => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <div
      className="flex flex-row border px-4 py-4 space-x-4 border-surface-variant rounded-lg overflow-hidden hover:shadow-lg hover:bg-surface-variant transition duration-200 cursor-pointer"
      onClick={() => onClick(recipe.id)}
    >
      <div className="w-32 h-fit">
        <img
          src={recipe.image_path}
          alt={recipe.name}
          className="rounded-md w-32 h-full object-cover"
        />
      </div>
      <div className="space-y-2 flex-1 py-2 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-on-surface">{recipe.name}</h3>
          <p className="text-on-surface text-sm line-clamp-3">
            {recipe.description}
          </p>
          <div className="flex space-x-2 pt-2">
            <Chip
              label={`${recipe.type.replace("_", " ")}`}
              className=" bg-primary-container text-on-primary-container"
            />
            <Chip
              label={`${minute2Text(recipe.time_to_cook)}`}
              className="bg-primary-container text-on-primary-container"
            />
          </div>
        </div>
        <button className="self-start hover:underline font-bold text-on-surface-variant mt-2">
          View Recipe{" "}
          <span className="material-symbols-rounded align-middle">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
