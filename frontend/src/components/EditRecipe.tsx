import type { Recipe } from "../types/recipe";
import IconButton from "./IconButton";
import { useState, useEffect, useCallback } from "react";
import ImageGallery from "./ImageGallery";

interface ValidationErrors {
  [key: string]: string;
}

interface EditRecipeProps {
  recipe: Recipe;
  onEditSave: (updatedRecipe: Recipe) => void;
  onEditCancel: () => void;
}

export default function EditRecipe({
  recipe,
  onEditSave,
  onEditCancel,
}: EditRecipeProps) {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // --- Validation Logic ---
  const validate = useCallback(
    (r: Recipe): ValidationErrors => {
      const e: ValidationErrors = {};
      const trim = (v: string | undefined) => (v ? v.trim() : "");

      if (!trim(r.name)) e.name = "Name is required.";
      if (r.name && r.name.length > 120) e.name = "Name must be under 120 characters.";

      if (r.description && r.description.length > 2000)
        e.description = "Description too long (max 2000 chars).";

      // Nutrition validations
      if (r.nutrition) {
        const { calories, fat, carbohydrates, protein } = r.nutrition;
        if (calories !== undefined && (calories < 0 || calories > 20000))
          e["nutrition.calories"] = "Calories must be between 0 and 20000.";
        if (fat !== undefined && (fat < 0 || fat > 500))
          e["nutrition.fat"] = "Fat must be between 0 and 500g.";
        if (carbohydrates !== undefined && (carbohydrates < 0 || carbohydrates > 2000))
          e["nutrition.carbohydrates"] = "Carbs must be between 0 and 2000g.";
        if (protein !== undefined && (protein < 0 || protein > 500))
          e["nutrition.protein"] = "Protein must be between 0 and 500g.";
      }

      if (r.time_to_cook !== undefined && (r.time_to_cook <= 0))
        e.time_to_cook = "Time must be greater than 0.";

      if (r.servings !== undefined && (r.servings < 0 || r.servings > 200))
        e.servings = "Servings must be 0 - 200.";

      // Ingredient validations
      r.ingredients.forEach((ing, idx) => {
        if (!ing.name.trim()) e[`ingredients.${idx}.name`] = "Ingredient name required.";
        if (!ing.quantity.trim()) e[`ingredients.${idx}.quantity`] = "Quantity required.";
        if (ing.quantity.length > 40)
          e[`ingredients.${idx}.quantity`] = "Keep quantity concise (<40 chars).";
      });

      // Steps validations
      r.steps.forEach((step, idx) => {
        if (!step.description.trim()) e[`steps.${idx}.description`] = "Step cannot be empty.";
        if (step.description.length > 2000)
          e[`steps.${idx}.description`] = "Step too long (max 2000 chars).";
      });

      if (r.notes && r.notes.length > 3000)
        e.notes = "Notes too long (max 3000 chars).";

      if (!r.type) e.type = "Dish type required.";

      return e;
    },
    [],
  );

  useEffect(() => {
    setErrors(validate(editedRecipe));
  }, [editedRecipe, validate]);

  const markTouched = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const canSave = Object.keys(errors).length === 0;

  const attemptSave = () => {
    const currentErrors = validate(editedRecipe);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;
    // Trim certain text fields before saving
    const cleaned: Recipe = {
      ...editedRecipe,
      name: editedRecipe.name.trim(),
      description: editedRecipe.description?.trim() || "",
      notes: editedRecipe.notes?.trim(),
      ingredients: editedRecipe.ingredients.map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity.trim(),
      })),
      steps: editedRecipe.steps.map((s) => ({
        description: s.description.trim(),
      })),
    };
    onEditSave(cleaned);
  };

  return (
    <div className="flex flex-col md:flex-row md:space-x-6">
      <ImageGallery
        userImages={recipe.user_image_paths}
        recipeType={editedRecipe.type}
      />
      <div
        className={`p-4 ${recipe.user_image_paths.length > 0 ? "md:w-1/2" : "md:w-full"} overflow-y-auto space-y-8`}
      >
        {/* Basic Info */}
        <fieldset className="border border-outline rounded-md p-4 bg-surface-container">
          <legend className="px-2 text-sm font-semibold text-primary">Basic Info</legend>
          <div className="mb-4">
            <label className="text-primary block mb-1 font-semibold" htmlFor="recipeName">
              Recipe Name
            </label>
            <input
              id="recipeName"
              type="text"
              required
              placeholder="e.g., Chocolate Chip Cookies"
              value={editedRecipe.name}
              onBlur={() => markTouched("name")}
              onChange={(e) => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
              aria-invalid={!!errors.name}
              className={`w-full p-2 border rounded bg-background text-on-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.name && touched.name ? "border-error" : "border-border"}`}
            />
            {errors.name && touched.name && (
              <p className="text-error text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="text-primary block mb-1 font-semibold" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Short description of the dish"
              value={editedRecipe.description}
              onBlur={() => markTouched("description")}
              onChange={(e) => setEditedRecipe({ ...editedRecipe, description: e.target.value })}
              aria-invalid={!!errors.description}
              className={`w-full p-2 border rounded bg-background text-on-background h-24 resize-y focus:outline-none focus:ring-2 focus:ring-primary ${errors.description && touched.description ? "border-error" : "border-border"}`}
            />
            <div className="flex justify-between text-xs text-on-surface mt-1">
              <span>{editedRecipe.description?.length || 0} / 2000</span>
              {errors.description && touched.description && (
                <span className="text-error">{errors.description}</span>
              )}
            </div>
          </div>
        </fieldset>

        {/* Nutrition */}
        <fieldset className="border border-outline rounded-md p-4 bg-surface-container">
          <legend className="px-2 text-sm font-semibold text-primary">Nutrition</legend>
            <div className="flex flex-col gap-4">
            {[
              { key: "calories", label: "Calories", unit: "kcal", min: 0 },
              { key: "fat", label: "Fat", unit: "g", min: 0 },
              { key: "carbohydrates", label: "Carbs", unit: "g", min: 0 },
              { key: "protein", label: "Protein", unit: "g", min: 0 },
            ].map((n) => {
              const fieldKey = `nutrition.${n.key}`;
              const value =
              editedRecipe.nutrition?.[n.key as keyof typeof editedRecipe.nutrition] ?? "";
              return (
              <div key={n.key} className="flex flex-col">
                <label
                className="text-xs font-medium text-on-surface-variant mb-1"
                htmlFor={fieldKey}
                >
                {n.label} ({n.unit})
                </label>
                <input
                id={fieldKey}
                type="number"
                min={n.min}
                value={value}
                onBlur={() => markTouched(fieldKey)}
                onChange={(e) =>
                  setEditedRecipe({
                  ...editedRecipe,
                  nutrition: {
                    ...(editedRecipe.nutrition || {}),
                    [n.key]: e.target.value === "" ? undefined : Number(e.target.value),
                  },
                  })
                }
                aria-invalid={!!errors[fieldKey]}
                className={`p-2 border rounded bg-background text-on-background focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors[fieldKey] && touched[fieldKey] ? "border-error" : "border-border"
                }`}
                />
                {errors[fieldKey] && touched[fieldKey] && (
                  <span className="text-error text-2xs mt-1">{errors[fieldKey]}</span>
                )}
              </div>
              );
            })}
            </div>
        </fieldset>

        {/* Timing & Servings */}
        <fieldset className="border border-outline rounded-md p-4 bg-surface-container">
          <legend className="px-2 text-sm font-semibold text-primary">Timing & Servings</legend>
            <div className="flex flex-col gap-4 text-on-surface-variant">
            <div className="flex flex-col">
              <label htmlFor="time_to_cook" className="text-xs font-medium mb-1">
                Time to Cook (min)
              </label>
                <input
                id="time_to_cook"
                type="number"
                value={editedRecipe.time_to_cook ?? ""}
                onBlur={() => markTouched("time_to_cook")}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditedRecipe({
                    ...editedRecipe,
                    time_to_cook: val === "" ? 0 : Number(val),
                  });
                }}
                aria-invalid={!!errors.time_to_cook}
                className={`p-2 border rounded bg-background text-on-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.time_to_cook && touched.time_to_cook ? "border-error" : "border-border"}`}
                />
              {errors.time_to_cook && touched.time_to_cook && (
                <span className="text-error text-2xs mt-1">{errors.time_to_cook}</span>
              )}
            </div>
            <div className="flex flex-col ">
              <label htmlFor="servings" className="text-xs font-medium mb-1">
                Servings
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditedRecipe({
                      ...editedRecipe,
                      servings: Math.max(0, (editedRecipe.servings || 0) - 1),
                    })
                  }
                  className="px-2 py-1 rounded bg-surface border hover:bg-surface/70 transition-colors"
                  aria-label="Decrease servings"
                >
                  -
                </button>
                <span className="min-w-[72px] text-center text-sm font-medium">
                  {editedRecipe.servings ? `${editedRecipe.servings} ${editedRecipe.servings === 1 ? "serving" : "servings"}` : "N/A"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setEditedRecipe({
                      ...editedRecipe,
                      servings: (editedRecipe.servings || 0) + 1,
                    })
                  }
                  className="px-2 py-1 rounded bg-surface border hover:bg-surface/70 transition-colors"
                  aria-label="Increase servings"
                >
                  +
                </button>
              </div>
              {errors.servings && touched.servings && (
                <span className="text-error text-2xs mt-1">{errors.servings}</span>
              )}
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="type" className="text-xs font-medium mb-1">
                Dish Type
              </label>
              <select
                id="type"
                value={editedRecipe.type || ""}
                onBlur={() => markTouched("type")}
                onChange={(e) =>
                  setEditedRecipe({ ...editedRecipe, type: e.target.value as Recipe["type"] })
                }
                aria-invalid={!!errors.type}
                className={`p-2 border rounded bg-background text-on-background focus:outline-none focus:ring-2 focus:ring-primary ${errors.type && touched.type ? "border-error" : "border-border"}`}
              >
                <option value="" disabled>
                  Select a dish type
                </option>
                <option value="dessert">Dessert</option>
                <option value="main_dish">Main Dish</option>
                <option value="side_dish">Side Dish</option>
                <option value="appetizer">Appetizer</option>
                <option value="beverage">Beverage</option>
              </select>
              {errors.type && touched.type && (
                <span className="text-error text-2xs mt-1">{errors.type}</span>
              )}
            </div>
          </div>
        </fieldset>

        {/* Ingredients */}
        <fieldset className="border border-outline rounded-md p-4 bg-surface-container">
          <legend className="px-2 text-sm font-semibold text-primary flex items-center justify-between w-full">
            <span>Ingredients</span>
            <button
              type="button"
              onClick={() =>
                setEditedRecipe({
                  ...editedRecipe,
                  ingredients: [...editedRecipe.ingredients, { name: "", quantity: "" }],
                })
              }
              className="flex items-center px-2 py-1 text-xs rounded bg-primary text-on-primary hover:opacity-90"
            >
              <span className="material-symbols-rounded text-sm mr-1">add</span>
              Add
            </button>
          </legend>
          <div className="space-y-3">
            {editedRecipe.ingredients.map((ingredient, index) => {
              const nameKey = `ingredients.${index}.name`;
              const qtyKey = `ingredients.${index}.quantity`;
              return (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-start bg-surface/30 p-2 rounded-md border"
                >
                  <div className="col-span-5 flex flex-col">
                    <input
                      type="text"
                      placeholder="Ingredient"
                      value={ingredient.name}
                      onBlur={() => markTouched(nameKey)}
                      onChange={(e) => {
                        const ingredients = [...editedRecipe.ingredients];
                        ingredients[index].name = e.target.value;
                        setEditedRecipe({ ...editedRecipe, ingredients });
                      }}
                      aria-invalid={!!errors[nameKey]}
                      className={`p-2 border rounded bg-background text-on-background focus:outline-none focus:ring-2 focus:ring-primary ${errors[nameKey] && touched[nameKey] ? "border-error" : "border-border"}`}
                    />
                    {errors[nameKey] && touched[nameKey] && (
                      <span className="text-error text-2xs mt-1">{errors[nameKey]}</span>
                    )}
                  </div>
                  <div className="col-span-5 flex flex-col">
                    <input
                      type="text"
                      placeholder="Qty (e.g., 2 cups)"
                      value={ingredient.quantity}
                      onBlur={() => markTouched(qtyKey)}
                      onChange={(e) => {
                        const ingredients = [...editedRecipe.ingredients];
                        ingredients[index].quantity = e.target.value;
                        setEditedRecipe({ ...editedRecipe, ingredients });
                      }}
                      aria-invalid={!!errors[qtyKey]}
                      className={`p-2 border rounded bg-background text-on-background focus:outline-none focus:ring-2 focus:ring-primary ${errors[qtyKey] && touched[qtyKey] ? "border-error" : "border-border"}`}
                    />
                    {errors[qtyKey] && touched[qtyKey] && (
                      <span className="text-error text-2xs mt-1">{errors[qtyKey]}</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const ingredients = [...editedRecipe.ingredients];
                        ingredients.splice(index, 1);
                        setEditedRecipe({ ...editedRecipe, ingredients });
                      }}
                      aria-label={`Delete ingredient ${index + 1}`}
                      className="text-error hover:opacity-80 transition-colors flex items-center"
                    >
                      <span className="material-symbols-rounded text-xl">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {editedRecipe.ingredients.length === 0 && (
              <p className="text-xs text-on-surface">No ingredients yet. Add one above.</p>
            )}
          </div>
        </fieldset>

        {/* Steps */}
        <fieldset className="border border-outline rounded-md p-4 bg-surface-container">
          <legend className="px-2 text-sm font-semibold text-primary flex items-center justify-between w-full">
            <span>Steps</span>
            <button
              type="button"
              onClick={() =>
                setEditedRecipe({
                  ...editedRecipe,
                  steps: [...editedRecipe.steps, { description: "" }],
                })
              }
              className="flex items-center px-2 py-1 text-xs rounded bg-primary text-on-primary hover:opacity-90"
            >
              <span className="material-symbols-rounded text-sm mr-1">add</span>
              Add
            </button>
          </legend>
          <div className="space-y-4">
            {editedRecipe.steps.map((step, index) => {
              const stepKey = `steps.${index}.description`;
              return (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-surface/30 p-2 rounded-md border"
                >
                  <span className="text-on-surface font-bold text-sm pt-2 w-6 text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 flex flex-col">
                    <textarea
                      placeholder="Describe this step"
                      value={step.description}
                      onBlur={() => markTouched(stepKey)}
                      onChange={(e) => {
                        const steps = [...editedRecipe.steps];
                        steps[index].description = e.target.value;
                        setEditedRecipe({ ...editedRecipe, steps });
                      }}
                      aria-invalid={!!errors[stepKey]}
                      className={`w-full p-2 border rounded bg-background text-on-background h-24 resize-y focus:outline-none focus:ring-2 focus:ring-primary ${errors[stepKey] && touched[stepKey] ? "border-error" : "border-border"}`}
                    />
                    <div className="flex justify-between text-2xs text-on-surface mt-1">
                      <span>{step.description.length} / 2000</span>
                      {errors[stepKey] && touched[stepKey] && (
                        <span className="text-error">{errors[stepKey]}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const steps = [...editedRecipe.steps];
                      steps.splice(index, 1);
                      setEditedRecipe({ ...editedRecipe, steps });
                    }}
                    aria-label={`Delete step ${index + 1}`}
                    className="text-error hover:opacity-80 transition-colors flex items-center pt-2"
                  >
                    <span className="material-symbols-rounded text-xl">delete</span>
                  </button>
                </div>
              );
            })}
            {editedRecipe.steps.length === 0 && (
              <p className="text-xs text-on-surface">No steps yet. Add one above.</p>
            )}
          </div>
        </fieldset>

        {/* Notes */}
        <fieldset className="border border-outline rounded-md p-4 bg-surface-container">
          <legend className="px-2 text-sm font-semibold text-primary">Notes</legend>
          <textarea
            placeholder="Optional notes, tips, variations..."
            value={editedRecipe.notes || ""}
            onBlur={() => markTouched("notes")}
            onChange={(e) => setEditedRecipe({ ...editedRecipe, notes: e.target.value })}
            aria-invalid={!!errors.notes}
            className={`w-full p-2 border rounded bg-background text-on-background h-24 resize-y focus:outline-none focus:ring-2 focus:ring-primary ${errors.notes && touched.notes ? "border-error" : "border-border"}`}
          />
          <div className="flex justify-between text-2xs text-on-surface mt-1">
            <span>{editedRecipe.notes?.length || 0} / 3000</span>
            {errors.notes && touched.notes && (
              <span className="text-error">{errors.notes}</span>
            )}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-4">
          <IconButton icon="close" onClick={onEditCancel} label="Cancel" />
          <div className={`relative ${!canSave ? "opacity-50 pointer-events-none" : ""}`}>
            <IconButton
              icon="save"
              onClick={attemptSave}
              disabled={!canSave}
              aria-disabled={!canSave}
              label={!canSave ? "Fix errors before saving" : "Save"}
            />
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-6 border border-error bg-error/5 rounded p-3 text-error text-2xs space-y-1">
            <div className="flex items-center space-x-1">
              <span className="material-symbols-rounded">error</span>
              <p className="font-semibold text-xs">Validation Issues:</p>
            </div>
            {Object.entries(errors).map(([k, v]) => (
              <p key={k} className="leading-snug">
                • {v}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
