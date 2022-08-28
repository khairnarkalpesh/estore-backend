const app = require("./app")
const dotenv = require("dotenv")
const { path } = require("./app")
const connectDatabase = require("./config/database");
const { connection } = require("mongoose");

// config
dotenv.config({path:"backend/config/config.env"});

// database connection
connectDatabase();

app.listen(process.env.PORT, () => {
    console.log("Server is running on port : ",process.env.PORT)
})