import AppBar from "./components/AppBar";
import { Routes, Route } from 'react-router-dom'
import RecipeDetail from './pages/RecipeDeail'
import NewRecipe from "./pages/NewRecipe";
import Home from "./pages/Home";
import AllRecipes from "./pages/AllRecipes";

function App() {

	return (
		<div className="min-h-screen bg-background py-4">
		<div className="px-4 max-w-7xl mx-auto">
			<AppBar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/recipe" element={<AllRecipes />} />
					<Route path="/recipe/:id" element={<RecipeDetail />} />
					<Route path="/new" element={<NewRecipe />} />
					<Route path="*" element={<div className="p-8">Page not found</div>} />
			</Routes>
			</main>
		</div>
	</div>
	)
}

export default App
