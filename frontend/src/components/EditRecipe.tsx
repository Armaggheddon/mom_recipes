import type { Recipe } from "../types/recipe";
import IconButton from "./IconButton";
import { useState } from "react";
import ImageGallery from "./ImageGallery";

interface EditRecipeProps {
	recipe: Recipe;
	onEditSave: (updatedRecipe: Recipe) => void;
	onEditCancel: () => void;
}

export default function EditRecipe({ recipe, onEditSave, onEditCancel }: EditRecipeProps) {
	const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
	const [selectedRecipeType, setSelectedRecipeType] = useState<string>(recipe.type || "");

	return (
		<div>
			{/* tiny gallery of images */}
			<div className="flex space-x-2 mb-4">
				<ImageGallery userImages={recipe.user_image_paths} generatedImage={recipe.generated_image_path || ""} recipeType={editedRecipe.type} />
			</div>

			{/* editable fields for title, ingredients, steps */}
			<div>
				<label className="text-primary block mb-2 font-semibold">Recipe Name:</label>
				<input
					type="text"
					value={editedRecipe.name}
					onChange={(e) => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
					className="w-full p-2 border rounded mb-4 bg-background text-on-background"
				/>

				<label className="text-primary block mb-2 font-semibold">Time to Cook (minutes):</label>
				<input
					type="number"
					value={editedRecipe.time_to_cook}
					onChange={(e) => setEditedRecipe({ ...editedRecipe, time_to_cook: parseInt(e.target.value) })}
					className="w-full p-2 border rounded mb-4 bg-background text-on-background"
				/>

				<label className="text-primary block mb-2 font-semibold">Servings:</label>
				<div className="flex-col mb-4 select-none">
					<div className="rounded-full bg-primary text-on-primary px-3 py-1 inline-block">
						<button onClick={() => setEditedRecipe({ ...editedRecipe, servings: Math.max(0, (editedRecipe.servings - 1)) })}>-</button>
						{
							editedRecipe.servings === undefined || editedRecipe.servings === 0 ? (
								<span className="mx-2">N/A</span>
							) : (
								<span className="mx-2">{editedRecipe.servings} serving{editedRecipe.servings !== 1 ? 's' : ''}</span>
							)
						}
						<button onClick={() => setEditedRecipe({ ...editedRecipe, servings: (editedRecipe.servings + 1) })}>+</button>
					</div>
				</div>

				<label className="text-primary block mb-2 font-semibold">Dish type:</label>
				<select
					value={selectedRecipeType}
					onChange={(e) => {
						setSelectedRecipeType(e.target.value);
						setEditedRecipe({ ...editedRecipe, type: e.target.value as Recipe["type"] });
					}}
					className="w-full p-2 border rounded mb-4 bg-background text-on-background"
				>
					<option value="dessert">Dessert</option>
					<option value="main_dish">Main Dish</option>
					<option value="side_dish">Side Dish</option>
					<option value="appetizer">Appetizer</option>
					<option value="beverage">Beverage</option>
				</select>

				<label className="text-primary block mb-2 font-semibold">Ingredients:</label>
				{editedRecipe.ingredients.map((ingredient, index) => {
					return (
						<div key={index} className="flex space-x-2 mb-2 items-center">
							<input
								type="text"
								value={ingredient.name}
								onChange={(e) => {
									const ingredients = [...editedRecipe.ingredients];
									ingredients[index].name = e.target.value;
									setEditedRecipe({ ...editedRecipe, ingredients });
								}}
								className="w-full p-2 border rounded bg-background text-on-background"
							/>
							<input
								type="text"
								value={ingredient.quantity}
								onChange={(e) => {
									const ingredients = [...editedRecipe.ingredients];
									ingredients[index].quantity = e.target.value;
									setEditedRecipe({ ...editedRecipe, ingredients });
								}}
								className="w-full p-2 border rounded bg-background text-on-background"
							/>
							<button
								onClick={() => {
									const ingredients = [...editedRecipe.ingredients];
									ingredients.splice(index, 1);
									setEditedRecipe({ ...editedRecipe, ingredients });
								}}
								className="flex hover:opacity-80 transition-colors text-error"
							>
								<span className="material-symbols-rounded text-2xl">delete</span>
							</button>
						</div>
					)
				})}
				<div className="flex justify-center mt-4">
					<button
						onClick={() => {
							const ingredients = [...editedRecipe.ingredients, { name: "", quantity: "" }];
							setEditedRecipe({ ...editedRecipe, ingredients });
						}}
						className="flex mb-4 px-4 py-2 bg-primary text-on-primary font-bold rounded"
					>
						<span className="material-symbols-rounded mr-2">add</span>
						<p>Add Ingredient</p>
					</button>
				</div>

				<label className="text-primary block mb-2 font-semibold">Steps:</label>
				{editedRecipe.steps.map((step, index) => {
					return (
						<div key={index} className="flex space-x-2 mb-4 items-center">
							<span className="text-on-surface font-bold text-lg font-display me-2">{index + 1}</span>
							<textarea
								value={step.description}
								onChange={(e) => {
									const steps = [...editedRecipe.steps];
									steps[index].description = e.target.value;
									setEditedRecipe({ ...editedRecipe, steps });
								}}
								className="w-full p-2 border rounded bg-background text-on-background"
							/>
							<button
								onClick={() => {
									const steps = [...editedRecipe.steps];
									steps.splice(index, 1);
									setEditedRecipe({ ...editedRecipe, steps });
								}}
								className="flex items-center justify-center hover:opacity-80 transition-colors text-error"
							>
								<span className="material-symbols-rounded text-2xl">delete</span>
							</button>
						</div>
					)
				})}
				<div className="flex justify-center">
					<button
						onClick={() => {
							const steps = [...editedRecipe.steps, { description: "" }];
							setEditedRecipe({ ...editedRecipe, steps });
						}}
						className="flex mb-4 px-4 py-2 bg-primary text-on-primary font-bold rounded"
					>
						<span className="material-symbols-rounded mr-2">add</span>
						<p>Add Step</p>
					</button>

				</div>
			</div>

			<label className="text-primary block mb-2 font-semibold">Notes:</label>
			<div className="flex items-center mb-4">
				<textarea
					value={editedRecipe.notes || ""}
					onChange={(e) => setEditedRecipe({ ...editedRecipe, notes: e.target.value })}
					className="w-full p-2 border rounded mb-4 bg-background text-on-background"
				/>
			</div>

			{/* Save and Cancel buttons */}
			<div className="flex justify-center space-x-4 mt-6">
				<IconButton icon="close" onClick={onEditCancel} label="Cancel" />
				<IconButton icon="save" onClick={() => onEditSave(editedRecipe)} label="Save" />
			</div>
		</div>
	);
}