import type { RecipeTiny, Recipe } from "../types/recipe";

const API_URL = "/api/v1/recipes";

const RecipeApi = {
  getLatestRecipes: async (): Promise<RecipeTiny[]> => {
    const response = await fetch(`${API_URL}/latest`);
    console.log("Fetching latest recipes from API:", response);
    if (!response.ok) {
      throw new Error("Failed to fetch latest recipes");
    }
    return response.json();
  },

  getFeelingLuckyRecipeId: async (): Promise<number | null> => {
    const response = await fetch(`${API_URL}/feeling-lucky`);
    if (!response.ok) {
      throw new Error("Failed to fetch feeling lucky recipe ID");
    }
    const data = await response.json();
    return data.recipeId || null;
  },

  getRecipes: async (
    currentPage: number = 0,
    recipesPerPage: number = 10,
    filterBy: { type?: string | string[]; queryString?: string } = {},
  ): Promise<RecipeTiny[]> => {
    let queryParams = `?start=${currentPage * recipesPerPage}&limit=${recipesPerPage}`;

    if (filterBy.type || filterBy.type === "") {
      const types = Array.isArray(filterBy.type)
        ? filterBy.type
        : [filterBy.type as string];
      types.filter(Boolean).forEach((t) => {
        queryParams += `&typeFilter=${encodeURIComponent(t)}`;
      });
    }
    if (filterBy.queryString) {
      queryParams += `&queryString=${encodeURIComponent(filterBy.queryString)}`;
    }

    const response = await fetch(`${API_URL}${queryParams}`);

    console.log("Fetching recipes from API:", response);
    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }
    return response.json();
  },

  getRecipeById: async (id: number): Promise<Recipe | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    console.log(`Fetching recipe ${id} from API:`, response);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Failed to fetch recipe");
    }
    return response.json();
  },

  postNewRecipe: async (images: File[]): Promise<number | null> => {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("user_images", image);
      });

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to post new recipe, status:",
          response.status,
          errorData,
        );

        // Handle validation errors (non-recipe images)
        if (response.status === 400 && errorData.type === "validation_error") {
          throw new Error(
            errorData.error ||
              "The uploaded images do not appear to contain a valid recipe.",
          );
        }

        // Handle other errors
        throw new Error(
          errorData.error || "Failed to create recipe. Please try again.",
        );
      }

      const result = await response.json();
      if (!result.recipeId) {
        console.error("No recipe ID returned from API:", result);
        return null;
      }
      return result.recipeId;
    } catch (error) {
      console.error("Error posting new recipe:", error);
      throw error; // Re-throw to let the caller handle it
    }
  },

  updateRecipe: async (
    id: number,
    updatedData: Partial<Recipe>,
  ): Promise<Recipe> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update recipe, status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  },

  deleteRecipeById: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.status === 404) {
        console.error("Recipe not found for deletion:", id);
        return false;
      }

      if (!response.ok) {
        console.error("Failed to delete recipe, status:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting recipe:", error);
      return false;
    }
  },
};

export default RecipeApi;
