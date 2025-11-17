import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipeApi from "../api/recipe.service";
import type { Recipe } from "../types/recipe";
import RecipeContents from "../components/RecipeContents";
import EditRecipe from "../components/EditRecipe";

export default function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RecipeApi.getRecipeById(Number(id))
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching recipe:", error);
        setLoading(false);
      });
  }, [id]);

  const deleteRecipe = async () => {
    if (!recipe) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe?",
    );
    if (!confirmed) return;

    try {
      const success = await RecipeApi.deleteRecipeById(recipe.id);
      if (success) {
        navigate(-1);
      } else {
        alert("Failed to delete recipe.");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("An error occurred while deleting the recipe.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async (_recipe: Recipe) => {
    if (!_recipe) return;

    // check if there are any changes actyually
    if (JSON.stringify(_recipe) === JSON.stringify(recipe)) {
      setIsEditing(false);
      return;
    }

    try {
      const updatedRecipe = await RecipeApi.updateRecipe(_recipe.id, _recipe);
      setRecipe(updatedRecipe);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving edited recipe:", error);
      alert("An error occurred while saving the recipe.");
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-on-background">Loading recipe...</p>
        </div>
      ) : recipe === null ? (
        <div className="flex flex-col items-center justify-center">
          <span role="img" aria-label="sad emoji" className="text-4xl">
            😢
          </span>
          <p className="text-error text-xl">Recipe not found.</p>
        </div>
      ) : (
        <div>
          {isEditing ? (
            <div>
              <EditRecipe
                recipe={JSON.parse(JSON.stringify(recipe))}
                onEditSave={handleSaveEdit}
                onEditCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <div>
              <div>
                <RecipeContents
                  recipe={recipe}
                  onDeleteClick={deleteRecipe}
                  onEditClick={handleEdit}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
