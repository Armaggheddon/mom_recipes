// src/ai/generative-ai.ts
// Logic for connecting to and interacting with Google's Generative AI.
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../models/recipe.model";
import { parse } from "path";
import { partialDeepStrictEqual } from "assert";
import * as fs from "node:fs";

// Custom error class for recipe validation failures
export class RecipeNotFoundError extends Error {
  constructor(
    message: string = "No valid recipe found in the provided images",
  ) {
    super(message);
    this.name = "RecipeNotFoundError";
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SYSTEM_PROMPT = `Analyze the following image(s) to determine if they contain a recipe.

IMPORTANT VALIDATION RULES:
1. Only extract recipes if the image clearly shows recipe content (ingredients, cooking instructions, food preparation steps).
2. If the image does NOT contain recipe-related content (e.g., random photos, non-food items, text unrelated to cooking, landscapes, people, etc.), you MUST set "recipeName" to "No recipe found".
3. The recipe could be handwritten, typed, or in any format, but it must be a legitimate recipe.
4. Images of random food without preparation instructions are NOT recipes.

For the nutritional facts, estimate based on typical values for the ingredients provided.

Extract the recipe details and structure them into a valid JSON object.
If you cannot find a legitimate recipe in the images, use "recipeName": "No recipe found".`;

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "The name of the recipe",
    },
    recipeType: {
      type: Type.STRING,
      enum: ["dessert", "main_dish", "side_dish", "appetizer", "beverage"],
      description:
        "The category of the recipe. Must be one of: dessert, main_dish, side_dish, appetizer, beverage.",
    },
    cookTime: {
      type: Type.NUMBER,
      description:
        "The total time required to make the recipe in minutes, e.g. 45.",
    },
    ingredients: {
      type: Type.ARRAY,
      description: "List of ingredients required for the recipe.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The name of the ingredient, e.g. 'sugar' or 'flour'.",
          },
          quantity: {
            type: Type.STRING,
            description:
              'The quantity of the ingredient, e.g. "2 cups" or "100g".',
          },
        },
        required: ["name", "quantity"],
      },
    },
    instructions: {
      type: Type.ARRAY,
      description: "An ordered list of steps to follow to prepare the recipe.",
      items: {
        type: Type.STRING,
        description: "A single step in the recipe instructions.",
      },
    },

    notes: {
      type: Type.STRING,
      description:
        "Optional: Any additional notes, tips, or variations mentioned in the recipe.",
    },
    servings: {
      type: Type.NUMBER,
      description:
        "The number of servings the recipe yields. If not specified, estimate based on typical portion sizes.",
    },
    nutrition: {
      type: Type.OBJECT,
      description:
        "Nutritional facts for the final dish based on the ingredients per serving.",
      properties: {
        calories: {
          type: Type.NUMBER,
          description: "The total number of calories per serving.",
        },
        protein: {
          type: Type.NUMBER,
          description: "The total amount of protein per serving in grams.",
        },
        fat: {
          type: Type.NUMBER,
          description: "The total amount of fat per serving in grams.",
        },
        carbohydrates: {
          type: Type.NUMBER,
          description:
            "The total amount of carbohydrates per serving in grams.",
        },
      },
      required: ["calories", "protein", "fat", "carbohydrates"],
    },
    description: {
      type: Type.STRING,
      description:
        "A brief description of the recipe, its flavor profile, or any special characteristics to be used as a summary.",
    },
  },
  required: [
    "recipeName",
    "recipeType",
    "cookTime",
    "ingredients",
    "instructions",
    "nutrition",
    "servings",
    "description",
  ],
};

const aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateRecipeFromImages = async (
  imagesBase64: string[],
): Promise<Recipe> => {
  const imageParts = imagesBase64.map((img) => {
    return {
      inlineData: {
        data: img,
        mimeType: "image/png",
      },
    };
  });

  const textPart = { text: SYSTEM_PROMPT };

  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: { parts: [textPart, ...imageParts] },
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  console.log("Generated Recipe from AI:", response.text);

  const parsedJson = JSON.parse(response.text ?? "{}");

  // Validate that we got a valid response
  if (!parsedJson || Object.keys(parsedJson).length === 0) {
    throw new RecipeNotFoundError(
      "AI returned an empty response. The images may not contain recipe content.",
    );
  }

  // Check if AI explicitly indicated no recipe was found
  if (
    parsedJson.recipeName === "No recipe found" ||
    !parsedJson.recipeName ||
    parsedJson.recipeName.trim() === ""
  ) {
    throw new RecipeNotFoundError(
      "The uploaded images do not appear to contain a valid recipe. Please upload images of recipe cards, cookbook pages, or handwritten recipes.",
    );
  }

  // Validate required fields have meaningful content
  if (!parsedJson.ingredients || parsedJson.ingredients.length === 0) {
    throw new RecipeNotFoundError(
      "No ingredients found. Please ensure the images contain a complete recipe with ingredients.",
    );
  }

  if (!parsedJson.instructions || parsedJson.instructions.length === 0) {
    throw new RecipeNotFoundError(
      "No cooking instructions found. Please ensure the images contain a complete recipe with preparation steps.",
    );
  }

  // Validate recipe type is valid
  const validTypes = [
    "dessert",
    "main_dish",
    "side_dish",
    "appetizer",
    "beverage",
  ];
  if (!parsedJson.recipeType || !validTypes.includes(parsedJson.recipeType)) {
    throw new RecipeNotFoundError(
      "Unable to determine recipe type. The images may not contain a valid recipe.",
    );
  }

  const recipe: Recipe = {
    id: "",
    name: parsedJson.recipeName,
    type: parsedJson.recipeType,
    time_to_cook: parsedJson.cookTime,
    ingredients: parsedJson.ingredients.map((ing: any) => ({
      name: ing.name,
      quantity: ing.quantity,
    })),
    steps: parsedJson.instructions.map((inst: string, index: number) => ({
      order: index + 1,
      description: inst,
    })),
    nutrition: parsedJson.nutrition,
    description: parsedJson.description,
    user_image_paths: [],
    notes: parsedJson.notes,
    servings: parsedJson.servings,
  };

  return recipe;
};
