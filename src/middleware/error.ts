/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/errorHandler";

export const middlewareErrorHandler = (
  err: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // Set default error code and message if not set
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Log the error for debugging purposes
  console.error("Error log:", err);

  // Wrong MongoDB ObjectId error (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value: any) => value.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error (MongoDB error)
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(
      err.keyValue
    ).join(", ")}`;
    err = new ErrorHandler(message, 400);
  }

  // JWT authentication error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired, please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // Missing required parameters
  if (err.name === "MissingRequiredParameters") {
    const message = "Missing required parameters.";
    err = new ErrorHandler(message, 400);
  }

  // Unauthorized access
  if (err.name === "UnauthorizedAccess") {
    const message = "Unauthorized access.";
    err = new ErrorHandler(message, 401);
  }

  // Forbidden access
  if (err.name === "ForbiddenAccess") {
    const message = "Forbidden access.";
    err = new ErrorHandler(message, 403);
  }

  // Send the error response
  response.status(err.statusCode).send({
    success: false,
    message: err.message,
  });
};
