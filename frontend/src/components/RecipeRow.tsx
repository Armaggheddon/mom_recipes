import type { RecipeTiny } from "../types/recipe";
import { minute2Text } from "../utils/utils";
import Chip from "./Chip";

interface RecipeRowProps {
  recipe: RecipeTiny;
  onClick: (id: number) => void;
}

export default function RecipeRow({ recipe, onClick }: RecipeRowProps) {
  return (
    <div
      className="flex items-center p-2 border-b border-surface-variant hover:bg-surface-variant hover:rounded-md cursor-pointer h-32 space-x-4"
      onClick={() => onClick(recipe.id)}
    >
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={recipe.image_path}
          alt={recipe.name}
          className="w-24 h-24 object-cover rounded-md"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between h-24">
        <div className="flex flex-col h-full">
          <h3 className="text-xl font-medium text-on-surface">{recipe.name}</h3>
          <p className="text-on-surface-variant text-sm line-clamp-2">
            {recipe.description}
          </p>
        </div>
        <div className="flex space-x-2">
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
    </div>
  );
}
