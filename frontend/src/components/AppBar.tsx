import { Link, useLocation } from 'react-router-dom'

export default function AppBar() {

	// how can I know the current route to highlight the active link?
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;


	return (
		<div>
			<header className="flex items-center justify-between pt-4 pb-8">
				<h2 className="text-xl font-display font-bold leading-tight text-on-background">Mom Recipes</h2>
				<nav>
					<ul className="flex space-x-6 items-center font-base">
						<li>
							<Link to="/" className={`text-on-background ${isActive("/") ? "font-bold" : "hover:text-on-background"}`}>
								<span className="hidden sm:inline">Home</span>
								<span className="sm:hidden">Home</span>
							</Link>
						</li>
						<li>
							<Link to="/recipe" className={`text-on-background ${isActive("/recipe") ? "font-bold" : "hover:text-on-background"}`}>
								<span className="hidden sm:inline">All Recipes</span>
								<span className="sm:hidden">Recipes</span>
							</Link>
						</li>
						<li>
							<Link to="/new" className="px-4 py-2 bg-primary rounded-full hover:opacity-70 transition font-semibold text-on-primary">
								<span className="hidden sm:inline">+ New Recipe</span>
								<span className="sm:hidden">+ New</span>
							</Link>
						</li>

					</ul>
				</nav>
			</header>
			<div className="border-b border-on-background mb-6" />
		</div>
	);
}