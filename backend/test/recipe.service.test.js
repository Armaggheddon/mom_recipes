"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// test/recipe.service.test.ts
// Unit tests for RecipeService
const recipe_service_1 = require("../src/services/recipe.service");
// Mock the database pool
jest.mock('../src/db/postgres');
const postgres_1 = __importDefault(require("../src/db/postgres"));
const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
};
describe('RecipeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        postgres_1.default.connect.mockResolvedValue(mockClient);
    });
    describe('getRecipePage', () => {
        it('should return a list of recipes without filter', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRows = [
                {
                    id: 1,
                    name: 'Test Recipe',
                    generated_image_path: 'path/to/image.jpg',
                    time_to_cook: 30,
                    type: 'main_dish',
                },
            ];
            mockClient.query.mockResolvedValue({ rows: mockRows });
            const result = yield recipe_service_1.RecipeService.getRecipePage(0, 10, undefined);
            expect(postgres_1.default.connect).toHaveBeenCalled();
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM recipes ORDER BY add_date LIMIT $1 OFFSET $2', [10, 0]);
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockRows);
        }));
        it('should return filtered recipes', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRows = [
                {
                    id: 1,
                    name: 'Dessert Recipe',
                    generated_image_path: 'path/to/image.jpg',
                    time_to_cook: 20,
                    type: 'dessert',
                },
            ];
            mockClient.query.mockResolvedValue({ rows: mockRows });
            const result = yield recipe_service_1.RecipeService.getRecipePage(0, 10, ['dessert']);
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM recipes WHERE type = ANY($3) ORDER BY add_date LIMIT $1 OFFSET $2', [10, 0, ['dessert']]);
            expect(result).toEqual(mockRows);
        }));
    });
    describe('getRecipeById', () => {
        it('should return a recipe if found', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRecipeRow = {
                id: 1,
                name: 'Test Recipe',
                user_image_paths: ['path1.jpg'],
                generated_image_path: 'path2.jpg',
                time_to_cook: 30,
                steps: [{ order: 1, description: 'Step 1' }],
                type: 'main_dish',
                notes: 'Some notes',
                servings: 4,
                created_at: new Date(),
            };
            const mockIngredientsRows = [
                { name: 'Ingredient 1', quantity: '1 cup' },
            ];
            mockClient.query
                .mockResolvedValueOnce({ rows: [mockRecipeRow] })
                .mockResolvedValueOnce({ rows: mockIngredientsRows });
            const result = yield recipe_service_1.RecipeService.getRecipeById(1);
            expect(result).toBeTruthy();
            expect(result.id).toBe(1);
            expect(result.name).toBe('Test Recipe');
            expect(result.ingredients).toEqual(mockIngredientsRows);
        }));
        it('should return null if recipe not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockClient.query.mockResolvedValue({ rows: [] });
            const result = yield recipe_service_1.RecipeService.getRecipeById(999);
            expect(result).toBeNull();
        }));
    });
    describe('createRecipe', () => {
        it('should create a new recipe', () => __awaiter(void 0, void 0, void 0, function* () {
            const newRecipe = {
                name: 'New Recipe',
                user_image_paths: [],
                generated_image_path: 'gen.jpg',
                time_to_cook: 45,
                ingredients: [{ name: 'Flour', quantity: '2 cups' }],
                steps: [{ order: 1, description: 'Mix' }],
                type: 'dessert',
                notes: 'Yummy',
                servings: 8,
            };
            const mockCreatedRow = Object.assign(Object.assign({}, newRecipe), { id: 1 });
            mockClient.query.mockResolvedValue({ rows: [mockCreatedRow] });
            const result = yield recipe_service_1.RecipeService.createRecipe(newRecipe);
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO recipes'), expect.arrayContaining([
                'New Recipe',
                [],
                'gen.jpg',
                45,
                JSON.stringify(newRecipe.ingredients),
                JSON.stringify(newRecipe.steps),
                'dessert',
                'Yummy',
                8,
            ]));
            expect(result).toEqual(mockCreatedRow);
        }));
    });
    describe('deleteRecipe', () => {
        it('should delete a recipe and return true', () => __awaiter(void 0, void 0, void 0, function* () {
            mockClient.query.mockResolvedValue({ rowCount: 1 });
            const result = yield recipe_service_1.RecipeService.deleteRecipe(1);
            expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM recipes WHERE id = $1', [1]);
            expect(result).toBe(true);
        }));
        it('should return false if recipe not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockClient.query.mockResolvedValue({ rowCount: 0 });
            const result = yield recipe_service_1.RecipeService.deleteRecipe(999);
            expect(result).toBe(false);
        }));
    });
});
