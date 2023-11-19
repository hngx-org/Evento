import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Evento API End Point Documentation",
      version: "1.0.0",
      description: "API for Evento API End Point Documentation",
    },
    servers: [
      {
        url: "http://localhost:3000/",
        description: "Local server",
      },
      {
        url: "https://your-live-server-url.com/",
        description: "Live server",
      },
    ],
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  apis: ["./src/routes/*.route.ts"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
