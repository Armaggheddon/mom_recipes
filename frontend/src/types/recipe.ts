export type RecipeType = 'dessert' | 'main_dish' | 'side_dish' | 'appetizer' | 'beverage';

export interface Ingredient {
	name: string;
	quantity: string;
}

export interface Step {
	description: string;
}

export interface Recipe {
	id: number;
	name: string;
	user_image_paths: string[];
	generated_image_path?: string;
	time_to_cook: number; // in minutes
	ingredients: Ingredient[];
	steps: Step[];
	type: RecipeType;
	notes?: string;
	servings: number;
	created_at?: Date;
}

export interface RecipeTiny {
	id: number;
	name: string;
	generated_image_path?: string;
	time_to_cook: number; // in minutes
	type: RecipeType;
}