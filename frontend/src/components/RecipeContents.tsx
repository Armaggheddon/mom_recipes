import { useState } from "react";
import type { Recipe } from "../types/recipe";
import { minute2Text } from "../utils/utils";
import IconButton from "./IconButton";
import ImageGallery from "./ImageGallery";

interface RecipeContentsProps {
  recipe: Recipe;
  onDeleteClick: () => void;
  onEditClick: () => void;
}

export default function RecipeContents({
  recipe,
  onDeleteClick,
  onEditClick,
}: RecipeContentsProps) {
  const [selectedIngredientIdx, setSelectedIngredientIdx] = useState<boolean[]>(
    [...Array(recipe.ingredients.length).fill(false)],
  );

  const toggleIngredient = (index: number) => {
    setSelectedIngredientIdx((prev) => {
      const newSelected = [...prev];
      newSelected[index] = !newSelected[index];
      return newSelected;
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:space-x-4">
      <ImageGallery
        userImages={recipe.user_image_paths}
        recipeType={recipe.type}
      />
      <div
        className={`p-4 ${recipe.user_image_paths.length > 0 ? "md:w-1/2" : "md:w-full"} overflow-y-auto`}
      >
        <h3 className="text-4xl font-semibold font-display mb-2 text-on-surface">
          {recipe.name}
        </h3>
        {/* <p className="text-gray-700 mb-4">{JSON.stringify(recipe)}</p> */}
        <div className="mt-2 flex space-x-2">
          <span className="px-2 py-1 bg-primary-container text-on-primary-container text-sm font-bold rounded-full">
            {recipe.type.replace("_", " ")}
          </span>
          <span className="px-2 py-1 bg-primary-container text-on-primary-container text-sm font-bold rounded-full">
            {minute2Text(recipe.time_to_cook)}
          </span>
          {recipe.servings != 0 && (
            <span className="px-2 py-1 bg-primary-container text-on-primary-container text-sm font-bold rounded-full">
              {recipe.servings} servings
            </span>
          )}
        </div>

        {/* description */}
        {recipe.description && (
          <p className="mt-4 text-on-surface-variant font-body">
            {recipe.description}
          </p>
        )}

        {/* nutrition facts */}
        {recipe.nutrition && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-tertiary-container rounded-lg p-4 text-center">
              <h5 className="text-sm text-on-tertiary-container font-display">
                Kcal
              </h5>
              <p className="text-2xl font-bold text-on-tertiary-container">
                {recipe.nutrition.calories}
              </p>
            </div>
            <div className="bg-tertiary-container rounded-lg p-4 text-center">
              <h5 className="text-sm text-on-tertiary-container font-display">
                Fats
              </h5>
              <p className="text-2xl font-bold text-on-tertiary-container">
                {recipe.nutrition.fat}g
              </p>
            </div>
            <div className="bg-tertiary-container rounded-lg p-4 text-center">
              <h5 className="text-sm text-on-tertiary-container font-display">
                Proteins
              </h5>
              <p className="text-2xl font-bold text-on-tertiary-container">
                {recipe.nutrition.protein}g
              </p>
            </div>
            <div className="bg-tertiary-container rounded-lg p-4 text-center">
              <h5 className="text-sm text-on-tertiary-container font-display">
                Carbs
              </h5>
              <p className="text-2xl font-bold text-on-tertiary-container">
                {recipe.nutrition.carbohydrates}g
              </p>
            </div>
          </div>
        )}

        {/* list of ingredients that, when selected are crossed out */}
        <div className="mt-4">
          <h4 className="text-primary text-xl font-semibold py-2.5">
            Ingredients
          </h4>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className={`flex items-center gap-3 select-none ${selectedIngredientIdx[index] ? "line-through opacity-75" : ""}`}
              >
                <input
                  type="checkbox"
                  id={`ingredient-${index}`}
                  className="h-4 w-4 accent-primary rounded border-outline-variant focus:ring-primary"
                  checked={selectedIngredientIdx[index]}
                  onChange={() => toggleIngredient(index)}
                />
                <label
                  htmlFor={`ingredient-${index}`}
                  className="cursor-pointer text-base text-on-background"
                >
                  {ingredient.name.charAt(0).toUpperCase() +
                    ingredient.name.slice(1)}{" "}
                  {ingredient.quantity}
                </label>
              </li>
            ))}
          </ul>
          {selectedIngredientIdx.every(Boolean) && (
            <div className="mt-4 p-3 border border-outline rounded-lg bg-surface text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-rounded">check_circle</span> You
              got everything you need to start! 🥳
            </div>
          )}
        </div>

        <div className="mt-4">
          <h4 className="text-primary text-xl font-semibold py-2.5">
            Instructions
          </h4>
          <ul className="list-decimal list-outside marker:font-bold marker:text-primary space-y-6 pl-5">
            {recipe.steps.map((step, index) => (
              <li
                key={index}
                className="text-on-surface mb-2 pl-2 text-base leading-relaxed"
              >
                {step.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h4 className="text-primary text-xl font-semibold py-2.5">Notes</h4>
          <p className="text-on-surface">{recipe.notes}</p>
        </div>

        <div className="border-t border-outline my-10" />

        <div className="mt-2 flex justify-center space-x-4">
          <IconButton
            icon="delete"
            onClick={onDeleteClick}
            label="Delete Recipe"
          />
          <IconButton icon="edit" onClick={onEditClick} label="Edit Recipe" />
        </div>
      </div>
    </div>
  );
}
