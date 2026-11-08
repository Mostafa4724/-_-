
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve the Admin and User pages
app.use("/admin", express.static(path.join(__dirname, "../admin")));
app.use("/user", express.static(path.join(__dirname, "../user")));

// Temporary shared data
let sharedData = {
    message: "Hello from the User Page!"
};

// Admin updates data
app.post("/api/update", (req, res) => {
    sharedData = req.body;

    res.json({
        success: true,
        message: "Data updated successfully!"
    });
});

// User receives data
app.get("/api/data", (req, res) => {
    res.json(sharedData);
});

// Home page
app.get("/", (req, res) => {
    res.redirect("/user/index.html");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});
