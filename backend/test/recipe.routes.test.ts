// test/recipe.routes.test.ts
// Integration tests for recipe routes
import request from 'supertest';
import app from '../src/app';

// Mock the database pool
jest.mock('../src/db/postgres');

import pool from '../src/db/postgres';

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

describe('Recipe Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  describe('GET /api/v1/recipes', () => {
    it('should return a list of recipes', async () => {
      const mockRecipes = [
        {
          id: 1,
          name: 'Test Recipe',
          generated_image_path: 'path/to/image.jpg',
          time_to_cook: 30,
          type: 'main_dish',
        },
      ];
      mockClient.query.mockResolvedValue({ rows: mockRecipes });

      const response = await request(app)
        .get('/api/v1/recipes')
        .expect(200);

      expect(response.body).toEqual(mockRecipes);
      expect(pool.connect).toHaveBeenCalled();
    });

    it('should handle query parameters', async () => {
      const mockRecipes: any[] = [];
      mockClient.query.mockResolvedValue({ rows: mockRecipes });

      await request(app)
        .get('/api/v1/recipes?start=10&limit=5&filterBy=dessert')
        .expect(200);

      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM recipes WHERE type = ANY($3) ORDER BY add_date LIMIT $1 OFFSET $2',
        [5, 10, ['dessert']]
      );
    });
  });

  describe('POST /api/v1/recipes', () => {
    it('should create a new recipe', async () => {
      const newRecipe = {
        name: 'New Recipe',
        user_image_paths: [],
        generated_image_path: 'gen.jpg',
        time_to_cook: 45,
        ingredients: [{ name: 'Flour', quantity: '2 cups' }],
        steps: [{ order: 1, description: 'Mix ingredients' }],
        type: 'dessert',
        notes: 'Yummy',
        servings: 8,
      };

      const createdRecipe = { ...newRecipe, id: 1 };
      mockClient.query.mockResolvedValue({ rows: [createdRecipe] });

      const response = await request(app)
        .post('/api/v1/recipes')
        .send(newRecipe)
        .expect(201);

      expect(response.body).toEqual(createdRecipe);
    });

    it('should handle errors', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/v1/recipes')
        .send({})
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create recipe' });
    });
  });

  describe('GET /api/v1/recipes/:id', () => {
    it('should return a recipe by id', async () => {
      const mockRecipe = {
        id: 1,
        name: 'Test Recipe',
        user_image_paths: [],
        generated_image_path: 'gen.jpg',
        time_to_cook: 30,
        steps: [],
        type: 'main_dish',
        ingredients: [{ name: 'Ingredient', quantity: '1 cup' }],
        notes: '',
        servings: 4,
        created_at: new Date(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [mockRecipe] })
        .mockResolvedValueOnce({ rows: mockRecipe.ingredients });

      const response = await request(app)
        .get('/api/v1/recipes/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Test Recipe');
    });

    it('should return 404 if recipe not found', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/v1/recipes/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Recipe not found' });
    });
  });

  describe('PUT /api/v1/recipes/:id', () => {
    it('should update a recipe', async () => {
      const updateData = { name: 'Updated Recipe' };
      const updatedRecipe = {
        id: 1,
        name: 'Updated Recipe',
        user_image_paths: [],
        generated_image_path: 'gen.jpg',
        time_to_cook: 30,
        steps: [],
        type: 'main_dish',
        ingredients: [],
        notes: '',
        servings: 4,
      };

      // Mock BEGIN, UPDATE, COMMIT, then getRecipeById queries
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(undefined) // UPDATE
        .mockResolvedValueOnce(undefined) // COMMIT
        .mockResolvedValueOnce({ rows: [updatedRecipe] }) // recipe query in getRecipeById
        .mockResolvedValueOnce({ rows: [] }); // ingredients query in getRecipeById

      const response = await request(app)
        .put('/api/v1/recipes/1')
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Recipe');
    });
  });

  describe('DELETE /api/v1/recipes/:id', () => {
    it('should delete a recipe', async () => {
      mockClient.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/v1/recipes/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Recipe deleted successfully' });
    });

    it('should return 404 if recipe not found', async () => {
      mockClient.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app)
        .delete('/api/v1/recipes/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Recipe not found' });
    });
  });

  describe('GET /health', () => {
    it('should return OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.text).toBe('OK');
    });
  });
});