import express from "express";
import { readdirSync } from "fs";
import { sayHelloController } from "./controllers/index";
import { authToken } from "./middlewares/index";
import generateSecretKey from "./services/generateSecretKey";
require("dotenv").config();
// import { connectionSource } from "./db/index";

const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./swagger");
import { errorHandler } from "./middlewares/index";

const app = express();

// Check if JWT_SECRET environment variable exists
const jwtSecret = process.env.JWT_SECRET;

// check commandline for Secret Key and add to environment variable
const secretKey = jwtSecret || generateSecretKey();

//  Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOptions));

// connectionSource
//   .initialize()
//   .then(async () => {
//     console.log("Database Connected");
//   })
//   .catch((error) => console.log(error));

// middleware setup

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authToken);

//serve all routes dynamically using readdirsync
readdirSync("./src/routes").map((path) =>
  app.use("/api/v1", require(`./routes/${path}`))
);
app.get("/", sayHelloController);
app.use(errorHandler);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
