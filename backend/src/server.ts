// Load and validate configuration first (will exit if any required vars are missing)
import { PORT } from "./config";
import app from "./app";

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
