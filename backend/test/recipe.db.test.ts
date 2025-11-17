import {
  describe,
  it,
  expect,
  afterAll,
  beforeAll,
  beforeEach,
} from "@jest/globals";
import { Pool } from "pg";
import { RecipeData, closePool } from "../src/data/recipe.db";
import { Recipe, RecipeType } from "../src/models/recipe.model";

const pool = new Pool({
  user: process.env.PG_USER || "admin",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "mom_recipes",
  password: process.env.PG_PASSWORD || "db_password",
  port: Number(process.env.PG_PORT) || 5432,
});

const initializeSchema = async () => {
  const client = await pool.connect();
  try {
    // Drop existing table and type if they exist
    await client.query("DROP TABLE IF EXISTS recipes CASCADE");
    await client.query("DROP TYPE IF EXISTS recipe_type CASCADE");

    // Create the recipe_type enum
    await client.query(`
      CREATE TYPE recipe_type AS ENUM ('dessert', 'main_dish', 'side_dish', 'appetizer', 'beverage')
    `);

    // Create the recipes table
    await client.query(`
      CREATE TABLE recipes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_image_paths TEXT[],
        time_to_cook INT,
        steps JSONB,
        ingredients JSONB,
        nutrition JSONB,
        description TEXT,
        type recipe_type,
        notes TEXT,
        servings INT,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
  } finally {
    client.release();
  }
};

const cleanUp = async () => {
  const client = await pool.connect();
  try {
    await client.query("TRUNCATE TABLE recipes RESTART IDENTITY CASCADE");
  } finally {
    client.release();
  }
};

const insertFakeRecipe = async (
  recipe: Omit<Recipe, "id" | "created_at" | "updated_at">,
) => {
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
  const client = await pool.connect();
  try {
    const result = await client.query(insertRecipeQuery, values);
    return result.rows[0].id;
  } finally {
    client.release();
  }
};

const fakeRecipe: Omit<Recipe, "id" | "created_at" | "updated_at"> = {
  name: "Test Recipe",
  user_image_paths: ["/path/to/image.jpg"],
  time_to_cook: 30,
  steps: [{ order: 1, description: "Step 1" }],
  ingredients: [{ name: "Ingredient 1", quantity: "1 cup" }],
  nutrition: { calories: 100, fat: 10, carbohydrates: 20, protein: 5 },
  description: "A test recipe.",
  type: "main_dish",
  notes: "A note",
  servings: 4,
};

describe("RecipeData", () => {
  beforeAll(async () => {
    await initializeSchema();
  });

  beforeEach(async () => {
    await cleanUp();
  });

  afterAll(async () => {
    await cleanUp();
    await closePool(); // Close the RecipeData pool
    await pool.end(); // Close the test pool
  });

  describe("createRecipe", () => {
    it("should create a new recipe and return its id", async () => {
      const newRecipeId = await RecipeData.createRecipe(fakeRecipe);
      expect(newRecipeId).toEqual(expect.any(Number));

      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT * FROM recipes WHERE id = $1",
          [newRecipeId],
        );
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].name).toBe(fakeRecipe.name);
      } finally {
        client.release();
      }
    });
  });

  describe("getRecipeById", () => {
    it("should return a recipe by its id", async () => {
      const newRecipeId = await insertFakeRecipe(fakeRecipe);
      const recipe = await RecipeData.getRecipeById(newRecipeId);
      expect(recipe).not.toBeNull();
      expect(recipe?.id).toBe(newRecipeId);
    });

    it("should return null if recipe not found", async () => {
      const recipe = await RecipeData.getRecipeById(999);
      expect(recipe).toBeNull();
    });
  });

  describe("getLatestRecipes", () => {
    it("should return the latest 6 recipes", async () => {
      for (let i = 0; i < 7; i++) {
        await insertFakeRecipe({ ...fakeRecipe, name: `Recipe ${i}` });
      }
      const recipes = await RecipeData.getLatestRecipes();
      expect(recipes.length).toBe(6);
      expect(recipes[0].name).toBe("Recipe 6");
    });
  });

  describe("getRandomRecipeId", () => {
    it("should return a random recipe id", async () => {
      await insertFakeRecipe(fakeRecipe);
      const randomRecipe = await RecipeData.getRandomRecipeId();
      expect(randomRecipe).not.toBeNull();
      expect(randomRecipe?.id).toEqual(expect.any(Number));
    });
  });

  describe("getRecipePage", () => {
    it("should return a paginated list of recipes", async () => {
      for (let i = 0; i < 10; i++) {
        await insertFakeRecipe({ ...fakeRecipe, name: `Recipe ${i}` });
      }
      const recipes = await RecipeData.getRecipePage(0, 5, {});
      expect(recipes.length).toBe(5);
      expect(recipes[0].name).toBe("Recipe 0");
    });
  });

  describe("updateRecipe", () => {
    it("should update a recipe", async () => {
      const newRecipeId = await insertFakeRecipe(fakeRecipe);
      const updatedRecipe = await RecipeData.updateRecipe(newRecipeId, {
        name: "Updated Recipe",
      });
      expect(updatedRecipe).not.toBeNull();
      expect(updatedRecipe?.name).toBe("Updated Recipe");
    });
  });

  describe("deleteRecipe", () => {
    it("should delete a recipe", async () => {
      const newRecipeId = await insertFakeRecipe(fakeRecipe);
      const deleted = await RecipeData.deleteRecipe(newRecipeId);
      expect(deleted).toBe(true);
      const recipe = await RecipeData.getRecipeById(newRecipeId);
      expect(recipe).toBeNull();
    });
  });
});
