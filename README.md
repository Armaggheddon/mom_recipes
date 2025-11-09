# Mom's Recipe 🍳

A modern web application designed to digitize and manage recipe collections, replacing traditional paper recipe cards with an intelligent, AI-powered platform.

> [!WARNING] 
> This project is in early development and is not guaranteed to be backward-compatible in future versions. When v1.0 is released this will no longer be the case and an upgrade path will be provided.

## About This Project

This application was created for two primary purposes:

1. **Practical Need**: To provide my mom (and others who rely on paper sheets, recipe cards, and handwritten notes) with a digital platform that simplifies recipe management, making it easy to store, search, and access recipes from any device.

2. **Learning Exercise**: To gain hands-on experience with modern web development technologies, particularly TypeScript, React, and full-stack application architecture.

### Goals
- Digitize and organize recipes for easy access and management
- Leverage AI to extract recipe details from images
- Provide a user-friendly interface for browsing, searching, and cooking recipes
- Fully local solution (except for AI calls) that can be self-hosted and run on personal hardware

### Key Features

- 📸 **AI-Powered Recipe Extraction**: Upload photos of handwritten or printed recipes, and the app uses Google's Gemini AI to automatically extract ingredients, instructions, and metadata
- 🖼️ **AI Image Generation**: Automatically generates appetizing images for recipes that don't have photos (this is currently not available due to API limits)
- 🔍 **Smart Search & Filtering**: Quickly find recipes by name or filter by type (desserts, main dishes, appetizers, etc.)
- 📱 **Camera Support**: Take photos directly from your device with high-resolution camera support
- ✅ **Interactive Cooking Mode**: Check off ingredients as you cook and track your progress through recipe steps
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS and Material Symbols

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Frontend** |
| React 19 | UI framework for building interactive components |
| TypeScript | Type-safe development and better code quality |
| Vite | Fast development server and optimized builds |
| React Router | Client-side routing and navigation |
| Tailwind CSS | Utility-first CSS framework for rapid styling |
| **Backend** |
| Node.js + Express | RESTful API server |
| TypeScript | Type-safe backend development |
| PostgreSQL | Relational database for recipe storage |
| MinIO | Object storage for images (S3-compatible) |
| Google Gemini AI | Recipe extraction from images and image generation |
| **DevOps** |
| Docker + Docker Compose | Containerization and orchestration |
| Nginx | Reverse proxy and static file serving |
| Multer | File upload handling |

## Prerequisites

Before running this project, ensure you have:

- **Docker** and **Docker Compose** installed on your system
- A **Google Gemini API key** (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mom_recipes
```

### 2. Configure Environment Variables

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Edit the `.env` file and replace the placeholder with your actual Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Run the Application

Start all services using Docker Compose:

```bash
docker-compose up --build
```

Run permanently in the background with:

```bash
docker-compose up -d --build
```

This command will:
- Build the frontend and backend containers
- Set up PostgreSQL database with initial schema
- Configure MinIO object storage
- Start Nginx reverse proxy
- Connect all services in a Docker network

### 4. Access the Application

Once all containers are running, open your browser and navigate to:

```
http://{your-machine-ip}
```

The application will be ready to use! You can now:
- Upload recipe images
- Create new recipes
- Browse and search your recipe collection
- Edit and delete recipes

> [!IMPORTANT] 
> Most modern browsers require HTTPS for camera access. This can be overcome by either setting up a reverse proxy with SSL (e.g., using Let's Encrypt) or by using localhost for development purposes. The other alternative is to allow the server address in the insecure origins settings of your browser. For Chrome, navigate to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add your server address `http://{your-machine-ip}` and finally activate the flag.

## Development Mode

For development with hot-reloading, use the development compose file:

```bash
docker-compose -f docker-compose.dev.yaml up
```

This provides:
- Frontend hot-reloading (Vite HMR)
- Backend automatic restart (Nodemon)
- Volume mounts for live code updates

## Project Structure

```
mom_recipes/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── api/      # API service layer
│   │   ├── components/ # Reusable React components
│   │   ├── pages/    # Page-level components
│   │   ├── types/    # TypeScript type definitions
│   │   └── utils/    # Utility functions
│   └── Dockerfile.dev
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── ai/       # Gemini AI integration
│   │   ├── config/   # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── db/       # Database connection
│   │   ├── models/   # Data models
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   └── storage/  # MinIO integration
│   └── Dockerfile
├── nginx/            # Nginx configuration
├── postgres/         # Database initialization scripts
├── docker-compose.yaml
└── .env.example
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recipes/latest` | Get 6 most recent recipes |
| GET | `/api/v1/recipes` | Get paginated recipes with filters |
| GET | `/api/v1/recipes/:id` | Get single recipe by ID |
| POST | `/api/v1/recipes` | Create recipe from uploaded images |
| PUT | `/api/v1/recipes/:id` | Update recipe details |
| DELETE | `/api/v1/recipes/:id` | Delete recipe |

## Stopping the Application

To stop all containers:

```bash
docker-compose down
```

To remove volumes (database and storage data):

```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If port 80 is already in use, modify the port mapping in `docker-compose.yaml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change 80 to any available port
```

### Database Connection Issues
Ensure PostgreSQL container is running:
```bash
docker-compose ps db
```

### API Key Issues
Verify your Gemini API key is correctly set in `.env` and has the necessary permissions.

## Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Recipe sharing and collaboration
- [ ] Meal planning and shopping list generation
- [ ] Nutritional information calculation
- [ ] Multi-language support (i18n)
- [ ] Recipe import from popular websites
- [ ] Mobile app version

> [!WARNING]
> Until v1.0 is released, the database schema is not guaranteed to remain the same. Therefore until then, the project should be intended for development and testing purposes only.

## License

This project is for educational and personal use. Contributions are more than welcome!

---

Made with ❤️ for Mom
