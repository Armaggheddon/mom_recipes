CREATE TYPE recipe_type AS ENUM ('dessert', 'main_dish', 'side_dish', 'appetizer', 'beverage');

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_image_paths TEXT[],
    generated_image_path TEXT,
    time_to_cook INT, -- in minutes
    steps JSONB,
    ingredients JSONB, -- Store ingredients as JSON array
    type recipe_type,
    notes TEXT,
    servings INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

