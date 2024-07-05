import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { middlewareErrorHandler } from "./middleware/error";

export const app = express();

// body parser limit for cloudinary
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(
	cors({
		origin: process.env.ORIGIN,
	})
);

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
