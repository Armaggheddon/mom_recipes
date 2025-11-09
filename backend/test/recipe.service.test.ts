// test/recipe.service.test.ts
// Unit tests for RecipeService
import { RecipeService } from '../src/services/recipe.service';
import { RecipeType } from '../src/models/recipe.model';

// Mock the database pool
jest.mock('../src/db/postgres');

import pool from '../src/db/postgres';

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

describe('RecipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  describe('getRecipePage', () => {
    it('should return a list of recipes without filter', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'Test Recipe',
          generated_image_path: 'path/to/image.jpg',
          time_to_cook: 30,
          type: 'main_dish' as RecipeType,
        },
      ];
      mockClient.query.mockResolvedValue({ rows: mockRows });

      const result = await RecipeService.getRecipePage(0, 10, undefined);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM recipes ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [10, 0]
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockRows);
    });

    it('should return filtered recipes', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'Dessert Recipe',
          generated_image_path: 'path/to/image.jpg',
          time_to_cook: 20,
          type: 'dessert' as RecipeType,
        },
      ];
      mockClient.query.mockResolvedValue({ rows: mockRows });

      const result = await RecipeService.getRecipePage(0, 10, ['dessert']);

      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM recipes WHERE type = ANY($3) ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [10, 0, ['dessert']]
      );
      expect(result).toEqual(mockRows);
    });
  });

  describe('getRecipeById', () => {
    it('should return a recipe if found', async () => {
      const mockRecipeRow = {
        id: 1,
        name: 'Test Recipe',
        user_image_paths: ['path1.jpg'],
        generated_image_path: 'path2.jpg',
        time_to_cook: 30,
        steps: [{ order: 1, description: 'Step 1' }],
        ingredients: [{ name: 'Ingredient 1', quantity: '1 cup' }],
        type: 'main_dish' as RecipeType,
        notes: 'Some notes',
        servings: 4,
        created_at: new Date(),
      };

      mockClient.query.mockResolvedValue({ rows: [mockRecipeRow] });

      const result = await RecipeService.getRecipeById(1);

      expect(result).toBeTruthy();
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('Test Recipe');
      expect(result!.ingredients).toEqual(mockRecipeRow.ingredients);
    });

    it('should return null if recipe not found', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await RecipeService.getRecipeById(999);

      expect(result).toBeNull();
    });
  });

  describe('createRecipe', () => {
    it('should create a new recipe', async () => {
      const newRecipe = {
        name: 'New Recipe',
        user_image_paths: [],
        generated_image_path: 'gen.jpg',
        time_to_cook: 45,
        ingredients: [{ name: 'Flour', quantity: '2 cups' }],
        steps: [{ order: 1, description: 'Mix' }],
        type: 'dessert' as RecipeType,
        notes: 'Yummy',
        servings: 8,
      };

      const mockCreatedRow = { ...newRecipe, id: 1 };
      mockClient.query.mockResolvedValue({ rows: [mockCreatedRow] });

      const result = await RecipeService.createRecipe(newRecipe);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recipes'),
        expect.arrayContaining([
          'New Recipe',
          [],
          'gen.jpg',
          45,
          JSON.stringify(newRecipe.ingredients),
          JSON.stringify(newRecipe.steps),
          'dessert',
          'Yummy',
          8,
        ])
      );
      expect(result).toEqual(mockCreatedRow);
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe and return true', async () => {
      mockClient.query.mockResolvedValue({ rowCount: 1 });

      const result = await RecipeService.deleteRecipe(1);

      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM recipes WHERE id = $1',
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false if recipe not found', async () => {
      mockClient.query.mockResolvedValue({ rowCount: 0 });

      const result = await RecipeService.deleteRecipe(999);

      expect(result).toBe(false);
    });
  });
});