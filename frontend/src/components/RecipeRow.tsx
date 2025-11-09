import type { RecipeTiny } from '../types/recipe';
import { category2Icon, minute2Text } from '../utils/utils';
import Chip from './Chip';

interface RecipeRowProps {
	recipe: RecipeTiny;
	onClick: (id: number) => void;
}

export default function RecipeRow({ recipe, onClick }: RecipeRowProps) {

	return (
		<div
			className={`flex items-center p-2 border-b border-surface-variant hover:bg-surface-variant hover:rounded-md cursor-pointer`}
			onClick={() => onClick(recipe.id)}
		>
			{
				(recipe.generated_image_path) ? (
					<img
						src={recipe.generated_image_path}
						alt={recipe.name}
						className="w-16 h-auto object-cover rounded-lg m-4"
					/>
				) : (
					<div className="w-16 h-16 bg-tertiary flex items-center justify-center rounded-lg m-4">
						<span className="text-3xl">{category2Icon(recipe.type)}</span>
					</div>
				)
			}
			<div className="flex-grow flex-col justify-between ml-4 space-y-4">
				<h3 className="text-xl font-medium text-on-surface">{recipe.name}</h3>
				<div className="mt-2 flex space-x-2">
					<Chip label={`${category2Icon(recipe.type)} ${recipe.type.replace('_', ' ')}`} className=" bg-blue-200 text-blue-800" />
					<Chip label={`⏲️ ${minute2Text(recipe.time_to_cook)}`} className="bg-green-200 text-green-800" />
				</div>
				
			</div>
		</div>
	);
}