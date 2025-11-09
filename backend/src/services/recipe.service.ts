// src/services/recipe.service.ts
// Contains the business logic for recipes.
import { start } from 'repl';
import pool from '../db/postgres';
import { Recipe, RecipeType, Ingredient, Step, RecipeTiny } from '../models/recipe.model';
import { create } from 'domain';
import { deleteUserImage } from '../storage/minio';



export const RecipeService = {
	getLatestRecipes: async (): Promise<RecipeTiny[] | null> => {
		const client = await pool.connect();
		try {
			const query = 'SELECT * FROM recipes ORDER BY created_at DESC LIMIT 6';
			const result = await client.query(query);
			return result.rows;
		} finally {
			client.release();
		}
	},

	getRandomRecipeId: async (): Promise<RecipeTiny | null> => {
		const client = await pool.connect();
		try {
			const query = 'SELECT id FROM recipes ORDER BY RANDOM() LIMIT 1';
			const result = await client.query(query);
			return result.rows[0] || null;
		} finally {
			client.release();
		}
	},

	getRecipePage: async (start: number, limit: number, filterBy: { type?: RecipeType[]; queryString?: string }): Promise<RecipeTiny[]> => {
		const client = await pool.connect();
		try {
			let query = 'SELECT * FROM recipes';
			const conditions: string[] = [];
			const params: any[] = [];
			let paramIndex = 1;

			if (filterBy?.type && filterBy.type.length > 0) {
				conditions.push(`type = ANY($${paramIndex++})`);
				params.push(filterBy.type);
			}

			if (filterBy?.queryString) {
				conditions.push(`name ILIKE $${paramIndex++}`);
				params.push(`%${filterBy.queryString}%`);
			}

			if (conditions.length > 0) {
				query += ' WHERE ' + conditions.join(' AND ');
			}

			query += ` ORDER BY id LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
			params.push(limit, start);

			const result = await client.query(query, params);
			return result.rows.map(row => ({
				id: row.id,
				name: row.name,
				generated_image_path: row.generated_image_path,
				time_to_cook: row.time_to_cook,
				type: row.type,
			}));
		} finally {
			client.release();
		}
	},

	getRecipeById: async (id: number): Promise<Recipe | null> => {
		const client = await pool.connect();
		try {
			const recipeQuery = 'SELECT * FROM recipes WHERE id = $1';
			const recipeResult = await client.query(recipeQuery, [id]);

			if (recipeResult.rows.length === 0) {
				return null;
			}

			const recipeData = recipeResult.rows[0];

			const recipe: Recipe = {
				id: recipeData.id,
				name: recipeData.name,
				user_image_paths: recipeData.user_image_paths || [],
				generated_image_path: recipeData.generated_image_path,
				time_to_cook: recipeData.time_to_cook,
				steps: recipeData.steps || [], // Parse JSONB steps
				type: recipeData.type,
				ingredients: recipeData.ingredients || [], // Parse JSONB ingredients
				notes: recipeData.notes,
				servings: recipeData.servings,
				created_at: recipeData.created_at,
			};

			return recipe;
		} finally {
			client.release();
		}
	},

	createRecipe: async (recipeData: Omit<Recipe, 'id'>): Promise<Recipe> => {
		const client = await pool.connect();
		try {
			const insertRecipeQuery = `
				INSERT INTO recipes (
					name, 
					user_image_paths, 
					generated_image_path, 
					time_to_cook, 
					ingredients, 
					steps, 
					type, 
					notes, 
					servings
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				RETURNING *
			`;
			const values = [
				recipeData.name,
				recipeData.user_image_paths,
				recipeData.generated_image_path,
				recipeData.time_to_cook,
				JSON.stringify(recipeData.ingredients),
				JSON.stringify(recipeData.steps),
				recipeData.type,
				recipeData.notes,
				recipeData.servings ?? 0,
			];
			const result = await client.query(insertRecipeQuery, values);
			return result.rows[0];
		} finally {
			client.release();
		}
	},

	updateRecipe: async (id: number, recipeUpdate: Partial<Omit<Recipe, 'id'>>): Promise<Recipe | null> => {
        const client = await pool.connect();
        try {
			const updateRecipeQuery = `
				UPDATE recipes
				SET
					name = COALESCE($1, name),
					user_image_paths = COALESCE($2, user_image_paths),
					generated_image_path = COALESCE($3, generated_image_path),
					time_to_cook = COALESCE($4, time_to_cook),
					ingredients = COALESCE($5, ingredients),
					steps = COALESCE($6, steps),
					type = COALESCE($7, type),
					notes = COALESCE($8, notes),
					servings = COALESCE($9, servings)
				WHERE id = $10
				RETURNING *
			`;
			const values = [
				recipeUpdate.name ?? null,
				recipeUpdate.user_image_paths ?? null,
				recipeUpdate.generated_image_path ?? null,
				recipeUpdate.time_to_cook ?? null,
				recipeUpdate.ingredients ? JSON.stringify(recipeUpdate.ingredients) : null,
				recipeUpdate.steps ? JSON.stringify(recipeUpdate.steps) : null,
				recipeUpdate.type ?? null,
				recipeUpdate.notes ?? null,
				recipeUpdate.servings ?? null,
				id
			];
			const result = await client.query(updateRecipeQuery, values);
			if (result.rows.length === 0) {
				return null;
			}
			return result.rows[0];
        } finally {
            client.release();
        }
    },

	deleteRecipe: async (id: number): Promise<boolean> => {
		const client = await pool.connect();
		try {
			// get the image paths associated with the recipe
			const recipeToDelete = await RecipeService.getRecipeById(id);
			if (!recipeToDelete) {
				return false;
			}

			const userImagePaths = recipeToDelete.user_image_paths || [];
			const generatedImagePath = recipeToDelete.generated_image_path;

			// delete images from storage
			for (const imgPath of userImagePaths) {
				await deleteUserImage(imgPath);
			}
			if (generatedImagePath) {
				await deleteUserImage(generatedImagePath);
			}

			// delete recipe from database

			const result = await client.query(
				'DELETE FROM recipes WHERE id = $1', [id]
			);
			return (result.rowCount ?? 0) > 0;
		} finally {
			client.release();
		}
	}
}
