// src/controllers/recipe.controller.ts
// Handles request and response for recipe-related operations.
import { Request, Response } from 'express';
import {RecipeService} from '../services/recipe.service';
import { Recipe, RecipeType } from '../models/recipe.model';
import { CreateRecipeFromImagesDto, UpdateRecipeDto } from '../dtos/recipe.dto';
import {generateImageFromRecipe, generateRecipeFromImages, RecipeNotFoundError} from '../ai/generative-ai';
import { putGeneratedImage, putUserImage } from '../storage/minio';

class RecipeController {

  async getFeelingLuckyRecipe(req: Request, res: Response): Promise<void> {
    try {
      const recipe = await RecipeService.getRandomRecipeId();
      if (recipe) {
        res.status(200).json({ recipeId: recipe.id });
      } else {
        res.status(404).json({ error: 'No recipes available' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch a random recipe' });
    }
  }

  async getLatestRecipes(req: Request, res: Response): Promise<void> {
    try {
      const latestRecipe = await RecipeService.getLatestRecipes();
      res.status(200).json(latestRecipe);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest recipe' });
    }
  }

  async getRecipePage(req: Request, res: Response): Promise<void> {
    try {
      const start = parseInt(req.query.start as string) || 0; // ?start=xxx&
      const limit = parseInt(req.query.limit as string) || 10; // ?limit=xxx&
      const stringQuery = req.query.queryString; // ?query=xxx&
      const recipeTypeFilter = req.query.typeFilter; // ?typeFilter=xxx&

      const filterBy: { type?: RecipeType[]; queryString?: string } = {};
      if (recipeTypeFilter && typeof recipeTypeFilter === 'string') {
        filterBy.type = [recipeTypeFilter as RecipeType];
      }
      if (stringQuery && typeof stringQuery === 'string') {
        filterBy.queryString = stringQuery;
      }

      const recipes = await RecipeService.getRecipePage(start, limit, filterBy);
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recipe page' });
    }
  };

  async createRecipe(req: Request, res: Response): Promise<void> {
    try {
      const userImages = req.files as Express.Multer.File[];
      if (!userImages || userImages.length === 0) {
        res.status(400).json({ error: 'No images uploaded' });
        return;
      }

      let generatedRecipe: Recipe;
      try {
        generatedRecipe = await generateRecipeFromImages(userImages.map(file => file.buffer.toString('base64')));
        if (!generatedRecipe) {
          res.status(400).json({ error: 'Failed to generate recipe from images. Please ensure images are related to recipes.' });
          return;
        }
      } catch (error) {
        // Handle recipe validation errors specifically
        if (error instanceof RecipeNotFoundError) {
          console.error("Recipe validation failed:", error.message);
          res.status(400).json({ 
            error: error.message,
            type: 'validation_error'
          });
          return;
        }
        
        // Handle other unexpected errors
        console.error("Error generating recipe:", error);
        res.status(500).json({ 
          error: 'An unexpected error occurred while processing the images. Please try again.',
          type: 'server_error'
        });
        return;
      }
      const uploadImgPromises: Promise<string>[] = userImages.map((file: Express.Multer.File) =>
        putUserImage(file.buffer, file.mimetype)
      );
      const uploadedImagePaths = await Promise.all(uploadImgPromises);

      generatedRecipe.user_image_paths = [...uploadedImagePaths.slice(0, userImages.length)];

      const newRecipe = await RecipeService.createRecipe(generatedRecipe);
      res.status(201).json(newRecipe);
    } catch (error) {
      console.log("Error in createRecipe:", error);
      res.status(500).json({ error: 'Failed to create recipe' });
    }
  };

  async getRecipeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const recipe = await RecipeService.getRecipeById(id);
      if (recipe) {
        res.status(200).json(recipe);
      } else {
        res.status(404).json({ error: 'Recipe not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  };

  async updateRecipe(req: Request<{id: string}, {}, UpdateRecipeDto>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updatedRecipe = await RecipeService.updateRecipe(id, req.body);
      if (updatedRecipe) {
        res.status(200).json(updatedRecipe);
      } else {
        res.status(404).json({ error: 'Recipe not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update recipe' });
    }
  }

  async deleteRecipe(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await RecipeService.deleteRecipe(id);
      if (deleted) {
        res.status(200).json({ message: 'Recipe deleted successfully' });
      } else {
        res.status(404).json({ error: 'Recipe not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete recipe' });
    }
  }
}

export default RecipeController;