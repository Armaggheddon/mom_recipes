import type { RecipeTiny } from "../types/recipe";
import { minute2Text, category2Icon } from "../utils/utils";

interface RecipeCardProps {
	recipe: RecipeTiny;
	onClick: (id: number) => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {

	return (
		<div className="flex border border-surface-variant cursor-pointer rounded-lg overflow-hidden w-full  hover:bg-surface-bright transition-all duration-200" onClick={() => onClick(recipe.id)}>
			<div className="flex flex-row w-full items-center">
				{(recipe.generated_image_path) ? (
					<img
						src={recipe.generated_image_path}
						alt={recipe.name}
						className="w-32 h-auto object-cover rounded-lg m-4"
					/>
				) : (
					<div className="w-32 h-32 bg-tertiary flex items-center justify-center rounded-lg m-4">
						<span className="text-5xl">{category2Icon(recipe.type)}</span>
					</div>
				)}

				<div className="p-4 flex flex-col h-full text-left justify-between">
					<div>
						<h2 className="text-3xl font-body text-on-surface">{recipe.name}</h2>
						<p className="text-on-surface-variant text-sm font-light mt-2">A delightful blend of flavors that brings comfort to every meal.</p>
					</div>
					<div className="mt-2 flex space-x-2">
						<span className="px-2 py-1 bg-blue-200 text-blue-800 text-sm font-bold rounded-full">
							{category2Icon(recipe.type)} {recipe.type.replace('_', ' ')}
						</span>
						<span className="px-2 py-1 bg-green-200 text-green-800 text-sm font-bold rounded-full">
							⏲️ {minute2Text(recipe.time_to_cook)}
						</span>
					</div>
				</div>

			</div>
		</div>
	)
}