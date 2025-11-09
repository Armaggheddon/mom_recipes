// src/dtos/recipe.dto.ts
// Data Transfer Objects for recipe API requests and responses
import { RecipeType, Ingredient, Step } from '../models/recipe.model';

// Request DTOs - what clients send to the API
export interface CreateRecipeFromImagesDto {
  user_images: Express.Multer.File[];
}

export interface CreateRecipeDto {
  name: string;
  user_image_paths: string[];
  time_to_cook: number; // in minutes
  ingredients: Ingredient[];
  steps: Step[];
  type: RecipeType;
  notes?: string;
  servings?: number;
}

export interface UpdateRecipeDto {
  name?: string;
  user_image_paths?: string[];
  time_to_cook?: number; // in minutes
  ingredients?: Ingredient[];
  steps?: Step[];
  type?: RecipeType;
  notes?: string;
  servings?: number;
}

// Query DTOs - for filtering and pagination
export interface RecipeQueryDto {
  start?: number;
  limit?: number;
  filterBy?: RecipeType[];
}

// Response DTOs - what the API returns to clients
export interface RecipeResponseDto {
  id: number;
  name: string;
  user_image_paths: string[];
  generated_image_path?: string;
  time_to_cook: number; // in minutes
  ingredients: Ingredient[];
  steps: Step[];
  type: RecipeType;
  notes?: string;
  servings?: number;
  created_at?: Date;
}

export interface RecipeTinyResponseDto {
  id: number;
  name: string;
  generated_image_path?: string;
  time_to_cook: number; // in minutes
  type: RecipeType;
}

export interface RecipePageResponseDto {
  recipes: RecipeTinyResponseDto[];
  total: number;
  start: number;
  limit: number;
}