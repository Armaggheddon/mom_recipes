// src/db/postgres.ts
// Handles the connection to the PostgreSQL database.
import { Recipe, RecipeType, Ingredient, Step, RecipeTiny } from '../models/recipe.model';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PG_USER || "admin",
  host: process.env.PG_HOST || "mom_recipes",
  database: process.env.PG_DATABASE || "mom_recipes",
  password: process.env.PG_PASSWORD || "db_password",
  port: Number(process.env.PG_PORT) || 5432,
});


export const RecipeData = {
    getLatestRecipes: async (): Promise<RecipeTiny[]> => {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM recipes ORDER BY created_at DESC LIMIT 6';
            const result = await client.query(query);
            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                image_path: row.user_image_paths[0],
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
			const query = 'SELECT * FROM recipes WHERE id = $1';
			const result = await client.query(query, [id]);
			return result.rows[0] || null;
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
                description: row.description,
                image_path: row.user_image_paths[0],
                time_to_cook: row.time_to_cook,
                type: row.type,
            }));
        } finally {
            client.release();
        }
    },

    createRecipe: async (recipe: Omit<Recipe, 'id'>): Promise<number> => {
        const client = await pool.connect();
        try {
            const insertRecipeQuery = `
                INSERT INTO recipes (
                    name, 
                    user_image_paths, 
                    time_to_cook, 
                    steps, 
                    ingredients, 
                    nutrition,
                    description,
                    type, 
                    notes, 
                    servings
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `;
            const values = [
                recipe.name,
                recipe.user_image_paths,
                recipe.time_to_cook,
                JSON.stringify(recipe.steps),
                JSON.stringify(recipe.ingredients),
                JSON.stringify(recipe.nutrition),
                recipe.description,
                recipe.type,
                recipe.notes,
                recipe.servings ?? 0,
            ];
            const result = await client.query(insertRecipeQuery, values);
            return result.rows[0].id;
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
                    time_to_cook = COALESCE($3, time_to_cook),
                    steps = COALESCE($4, steps),
                    ingredients = COALESCE($5, ingredients),
                    nutrition = COALESCE($6, nutrition),
                    description = COALESCE($7, description),
                    type = COALESCE($8, type),
                    notes = COALESCE($9, notes),
                    servings = COALESCE($10, servings),
                    updated_at = now()
                WHERE id = $11
                RETURNING *
            `;
            const values = [
                recipeUpdate.name ?? null,
                recipeUpdate.user_image_paths ?? null,
                recipeUpdate.time_to_cook ?? null,
                recipeUpdate.steps ? JSON.stringify(recipeUpdate.steps) : null,
                recipeUpdate.ingredients ? JSON.stringify(recipeUpdate.ingredients) : null,
                recipeUpdate.nutrition ? JSON.stringify(recipeUpdate.nutrition) : null,
                recipeUpdate.description ?? null,
                recipeUpdate.type ?? null,
                recipeUpdate.notes ?? null,
                recipeUpdate.servings ?? null,
                id,
            ];
            const result = await client.query(updateRecipeQuery, values);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    },

    deleteRecipe: async (id: number): Promise<boolean> => {
        const client = await pool.connect();
        try {
            const deleteRecipeQuery = 'DELETE FROM recipes WHERE id = $1';
            const result = await client.query(deleteRecipeQuery, [id]);
            return (result.rowCount ?? 0) > 0;
        } finally {
            client.release();
        }
    },
};