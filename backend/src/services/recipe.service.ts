// src/services/recipe.service.ts
// Contains the business logic for recipes.
import { start } from 'repl';
import { Recipe, RecipeType, Ingredient, Step, RecipeTiny } from '../models/recipe.model';
import { create } from 'domain';
import {RecipeData} from '../data/recipe.db';
import { deleteUserImage, putUserImage } from '../data/recipe.store';
import { generateRecipeFromImages } from '../ai/generative-ai';



export const RecipeService = {
	getLatestRecipes: async (): Promise<RecipeTiny[] | null> => {
		return RecipeData.getLatestRecipes();
	},

	getRandomRecipeId: async (): Promise<RecipeTiny | null> => {
		return RecipeData.getRandomRecipeId();
	},

	getRecipePage: async (start: number, limit: number, filterBy: { type?: RecipeType[]; queryString?: string }): Promise<RecipeTiny[]> => {
		return RecipeData.getRecipePage(start, limit, filterBy);
	},

	getRecipeById: async (id: number): Promise<Recipe | null> => {
		return RecipeData.getRecipeById(id);
	},

	createRecipe: async (userImages: Express.Multer.File[]): Promise<number> => {
		let generatedRecipe: Recipe = await generateRecipeFromImages(
			userImages.map(file => file.buffer.toString('base64'))
		);
		if (!generatedRecipe) {
			throw new Error('Failed to generate recipe from images');
		}

		const imagePaths: string[] = await Promise.all(
			userImages.map(async (file) => {
				const mimeType = file.mimetype;
				return putUserImage(file.buffer, mimeType);
			})
		);
		const recipeData: Recipe = {
			...generatedRecipe,
			user_image_paths: imagePaths
		};
		return RecipeData.createRecipe(recipeData);
	},

	updateRecipe: async (id: number, recipeUpdate: Partial<Omit<Recipe, 'id'>>): Promise<Recipe | null> => {
		return RecipeData.updateRecipe(id, recipeUpdate);
	},

	deleteRecipe: async (id: number): Promise<boolean> => {
		const recipe = await RecipeData.getRecipeById(id);
		if (!recipe) {
			return false;
		}

		await Promise.all(
			recipe.user_image_paths.map(async (path) => {
				return deleteUserImage(path);
			})
		);
		return RecipeData.deleteRecipe(id);
	}
}
