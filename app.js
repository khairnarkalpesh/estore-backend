const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");

// Routes import
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");

app.use(express.json())
app.use(cookieParser());
app.use("/api/v1", product);
app.use("/api/v1", user);

// Middleware for errors
app.use(errorMiddleware);

module.exports = app;