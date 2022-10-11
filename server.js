const app = require("./app");
const dotenv = require("dotenv");
const { path } = require("./app");
const connectDatabase = require("./config/database");
const { connection } = require("mongoose");
const cloudinary = require("cloudinary");

// Handling uncaught exceptins
process.on("uncaughtException", (err) => {
  console.log(err.message);
  console.log("Shutting down the server due to unhandled uncaught exceptins");
});

// config
dotenv.config({ path: "backend/config/config.env" });

// database connection
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on port : ", process.env.PORT);
});

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.log("Shutting down the server due to unhandled promise rejections");

  server.close(() => {
    process.exit(1);
  });
});
