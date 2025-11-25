import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the Vite build output
const distPath = join(__dirname, "dist");
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// For SPA routing – serve index.html for any unknown route
app.get("*", (req, res) => {
    const indexPath = join(distPath, "index.html");
    console.log(`Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
});
