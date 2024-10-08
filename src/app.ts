import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import path from "path";
import swaggerUi from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import compression from "compression";

import routes from "./routes/index";
import { middlewareErrorHandler } from "./middleware/error";
import OPENAPI_DOCS from "./swagger-docs/swagger";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

export const app = express();

// Rate limiter
app.use(limiter);

// body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(cors());

// compression
app.use(compression());

app.use(
  "/api-docs/swagger-ui",
  express.static(path.join(__dirname, "../node_modules/swagger-ui-dist"))
);

// routes
app.use("/api/v1", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(OPENAPI_DOCS));

// Testing api
app.get("/api/test", (request: Request, response: Response) => {
  response.status(200).send({
    success: true,
    message: "Your API is working fine",
  });
});

// Unknown API route
app.all("*", (request: Request, response: Response) => {
  response.status(404).send({
    success: false,
    message: `${request.originalUrl} route you are trying to reach does not exist`,
  });
});

app.use(middlewareErrorHandler);
