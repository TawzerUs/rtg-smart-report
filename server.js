import express from "express";
import path from "node:path";

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the Vite build output
app.use(express.static(path.resolve("dist")));

// For SPA routing – serve index.html for any unknown route
app.get("*", (req, res) => {
    res.sendFile(path.resolve("dist/index.html"));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
