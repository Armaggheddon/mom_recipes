// src/routes/recipe.routes.ts
// Defines the API routes for recipes.
import { NextFunction, Request, Response, Router } from "express";
import RecipeController from "../../controllers/recipe.controller";
import { UpdateRecipeDto } from "../../dtos/recipe.dto";

import upload from "../../middlewares/upload.middleware";

const recipeRouter = Router();

const recipeController = new RecipeController();

recipeRouter.get("/", (req: Request, res: Response) =>
  recipeController.getRecipePage(req, res),
);
recipeRouter.get("/feeling-lucky", (req: Request, res: Response) =>
  recipeController.getFeelingLuckyRecipe(req, res),
);
recipeRouter.get("/latest", (req: Request, res: Response) =>
  recipeController.getLatestRecipes(req, res),
);
recipeRouter.post(
  "/",
  upload.array("user_images"),
  (req: Request, res: Response) => recipeController.createRecipe(req, res),
);
recipeRouter.get("/:id", (req: Request<{ id: string }>, res: Response) =>
  recipeController.getRecipeById(req, res),
);
recipeRouter.put(
  "/:id",
  (req: Request<{ id: string }, {}, UpdateRecipeDto>, res: Response) =>
    recipeController.updateRecipe(req, res),
);
recipeRouter.delete("/:id", (req: Request<{ id: string }>, res: Response) =>
  recipeController.deleteRecipe(req, res),
);

export default recipeRouter;
