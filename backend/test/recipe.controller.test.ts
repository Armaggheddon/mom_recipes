import request from "supertest";
import app from "../src/app";
import { describe, it, expect, jest, beforeEach, afterAll } from "@jest/globals";
import { closePool } from "../src/data/recipe.db";

jest.mock("../src/services/recipe.service");

import { RecipeService } from "../src/services/recipe.service";
import { RecipeType } from "../src/models/recipe.model";

describe("Recipe Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closePool();
  });

  it("GET /api/v1/recipes - should return a list of recipes", async () => {
    const mockRecipes = [
      {
        id: 1,
        name: "Test Recipe",
        description: "This is a test recipe.",
        image_path: "path/to/image.jpg",
        time_to_cook: 30,
        type: "main_dish" as RecipeType,
      },
    ];
    jest.mocked(RecipeService).getRecipePage.mockResolvedValue(mockRecipes);

    const response = await request(app).get("/api/v1/recipes");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipes);
    expect(RecipeService.getRecipePage).toHaveBeenCalledWith(0, 10, {});
  });

  it("POST /api/v1/recipes - should create a new recipe", async () => {
    jest.mocked(RecipeService).createRecipe.mockResolvedValue(1);

    const response = await request(app)
      .post("/api/v1/recipes")
      .attach("user_images", Buffer.from("image"), "image.jpg");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ recipeId: 1 });
    expect(RecipeService.createRecipe).toHaveBeenCalled();
  });

  it("GET /api/v1/recipes - should handle query parameters", async () => {
    const mockRecipes: any[] = [];
    jest.mocked(RecipeService).getRecipePage.mockResolvedValue(mockRecipes);

    const response = await request(app).get(
      "/api/v1/recipes?start=10&limit=5&typeFilter=dessert",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipes);
    expect(RecipeService.getRecipePage).toHaveBeenCalledWith(10, 5, {
      type: ["dessert"],
    });
  });

  it("POST /api/v1/recipes - should handle errors", async () => {
    jest
      .mocked(RecipeService)
      .createRecipe.mockRejectedValue(new Error("Creation failed"));

    const response = await request(app)
      .post("/api/v1/recipes")
      .attach("user_images", Buffer.from("image"), "image.jpg");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to create recipe" });
    expect(RecipeService.createRecipe).toHaveBeenCalled();
  });
});
