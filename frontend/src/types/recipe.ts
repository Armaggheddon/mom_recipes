export type RecipeType =
  | "dessert"
  | "main_dish"
  | "side_dish"
  | "appetizer"
  | "beverage";

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Step {
  description: string;
}

export interface NutritionInfo {
  calories: number;
  fat: number; // in grams
  carbohydrates: number; // in grams
  protein: number; // in grams
}

export interface Recipe {
  id: number;
  name: string;
  user_image_paths: string[];
  time_to_cook: number; // in minutes
  steps: Step[];
  ingredients: Ingredient[];
  nutrition: NutritionInfo;
  description: string;
  type: RecipeType;
  notes?: string;
  servings: number;
  created_at?: Date;
}

export interface RecipeTiny {
  id: number;
  name: string;
  description: string;
  image_path: string;
  time_to_cook: number; // in minutes
  type: RecipeType;
}
