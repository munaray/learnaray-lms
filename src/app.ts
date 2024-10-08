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

// Initialize the express app
export const app = express();

// Middleware configuration

// 1. Rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

// 2. Body parser (limit request body to 50mb)
app.use(express.json({ limit: "50mb" }));

// 3. Cookie parser
app.use(cookieParser());

// 4. CORS (Cross-Origin Resource Sharing)
app.use(cors());

// 5. Compression middleware to compress response bodies
app.use(compression());

// 6. Set EJS as the view/template engine for rendering HTML pages
app.set("view engine", "ejs");

// Set the views directory to the "src/views" folder
app.set("views", path.join(__dirname, "views"));

// Static files for Swagger UI
app.use(
  "/api-docs/swagger-ui",
  express.static(path.join(__dirname, "../node_modules/swagger-ui-dist"))
);

// Routes

// 1. API routes
app.use("/api/v1", routes);

// 2. Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(OPENAPI_DOCS));

// 3. Render the EJS template on the root `/` route
app.get("/", (request: Request, response: Response) => {
  response.status(200).render("index"); // Renders the views/index.ejs file
});

// 4. Handle unknown routes (404 errors)
app.all("*", (request: Request, response: Response) => {
  response.status(404).send({
    success: false,
    message: `${request.originalUrl} route you are trying to reach does not exist`,
  });
});

// Error handling middleware
app.use(middlewareErrorHandler);
