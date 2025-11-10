import GridItems from "../components/GridItems"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import RecipeApi from "../api/recipe.service";
import type { RecipeTiny } from "../types/recipe";

export default function Home() {

	const navigate = useNavigate();

	const [featuredRecipes, setFeaturedRecipes] = useState<RecipeTiny[]>([]);

	useEffect(() => {
		const fetchFeaturedRecipes = async () => {
			try {
				const recipes = await RecipeApi.getLatestRecipes();
				setFeaturedRecipes(recipes);
			} catch (error) {
				console.error("Error fetching featured recipes:", error);
			}
		};

		fetchFeaturedRecipes();
	}, []);

	function onItemClick(id: number) {
		navigate(`/recipe/${id}`);
	}

	function onNewRecipeClick() {
		navigate('/new');
	}

	function onFeelingLuckyClick() {
		RecipeApi.getFeelingLuckyRecipeId().then(id => {
			if (id) {
				navigate(`/recipe/${id}`);
			}
		}).catch(error => {
			console.error("Error fetching feeling lucky recipe ID:", error);
		});
	}

	return (
		<main>
			<GridItems recipes={featuredRecipes} onItemClick={onItemClick} onNewRecipeClick={onNewRecipeClick} />
			{featuredRecipes.length > 0 && (
				<div className="flex justify-center mb-4">
					<button onClick={onFeelingLuckyClick}>
						<span className="underline font-semibold text-on-background">
							I'm Feeling Lucky 🍀
						</span>
					</button>
				</div>
			)}
		</main>
	)
}