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
			<img
				src={recipe.image_path}
				alt={recipe.name}
				className="w-24 h-24 object-cover rounded-md"
			/>
			<div className="flex-grow flex-col justify-between ml-4">
				<h3 className="text-xl font-medium text-on-surface">{recipe.name}</h3>
				<p className="text-on-surface-variant text-sm">{recipe.description}</p>
				<div className="mt-2 flex space-x-2">
					<Chip label={`${category2Icon(recipe.type)} ${recipe.type.replace('_', ' ')}`} className=" bg-blue-200 text-blue-800" />
					<Chip label={`⏲️ ${minute2Text(recipe.time_to_cook)}`} className="bg-green-200 text-green-800" />
				</div>
				
			</div>
		</div>
	);
}