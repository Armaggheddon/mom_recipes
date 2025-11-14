CREATE TYPE recipe_type AS ENUM ('dessert', 'main_dish', 'side_dish', 'appetizer', 'beverage');

-- steps JSONB,
-- {
--     "step_number": 1,
--     "description": "Preheat the oven to 350 degrees F (175 degrees C)."
-- }

-- ingredients JSONB, -- Store ingredients as JSON array
-- [
--     {
--         "name": "Flour",
--         "quantity": "2 cups"
--     },
--     {
--         "name": "Sugar",
--         "quantity": "1 cup"
--     }
-- ]

-- nutrition JSONB, -- Store nutrition info as JSON object
-- {
--     "calories": 250,
--     "protein": 5,
--     "fat": 10,
--     "carbohydrates": 35
-- }

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_image_paths TEXT[],
    time_to_cook INT, -- in minutes
    steps JSONB,
    ingredients JSONB, -- Store ingredients as JSON array
    nutrition JSONB, -- Store nutrition info as JSON object
    description TEXT,
    type recipe_type,
    notes TEXT,
    servings INT,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);