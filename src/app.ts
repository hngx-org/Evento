import express from "express";
import { readdirSync } from "fs";
import { sayHelloController } from "./controllers/index";
import 'dotenv/config';
import { authToken } from "./middlewares/index";
import { errorHandler } from "./middlewares/index";
import session from "express-session";
import passport from "./utils/passport";

const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./swagger");


const app = express();

//  Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOptions));

// middleware setup

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// app.use(authToken);

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
