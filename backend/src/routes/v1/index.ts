// src/routes/index.ts
// Main router file to aggregate all other routes.
import { Router } from 'express';
import recipeRouter from './recipe.routes';

const v1Router = Router();

v1Router.use(
    '/recipes', 
    recipeRouter
);

export default v1Router;