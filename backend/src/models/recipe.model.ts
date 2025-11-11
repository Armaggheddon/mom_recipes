// src/models/recipe.model.ts
// Defines the data model for a recipe.

export type RecipeType = 'dessert' | 'main_dish' | 'side_dish' | 'appetizer' | 'beverage';

export interface Ingredient {
	name: string;
	quantity: string;
}

export interface Step {
	order: number;
	description: string;
}

export interface Nutrition {
	calories: number;
	fat: number; // in grams
	carbohydrates: number; // in grams
	protein: number; // in grams
}

export interface Recipe {
	id: number | string;
	name: string;
	user_image_paths: string[];
	time_to_cook: number; // in minutes
	steps: Step[]; 
	ingredients: Ingredient[]; 
	nutrition: Nutrition;
	description: string;
	type: RecipeType;
	notes?: string;
	servings?: number;
	created_at?: Date;
	updated_at?: Date;
}

export interface RecipeTiny {
	id: number | string;
	name: string;
	description: string;
	image_path: string;
	time_to_cook: number; // in minutes
	type: RecipeType;
}

