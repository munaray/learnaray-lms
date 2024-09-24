import { Request, Response, NextFunction } from "express-serve-static-core";
import { body, validationResult } from "express-validator";

const handleValidationErrors = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const result = validationResult(request);
  if (!result.isEmpty()) {
    return response.status(400).send({
      error: result.array(),
    });
  }
  next();
};

export const validateCourseCreation = [
  body("name")
    .isLength({ min: 4, max: 100 })
    .withMessage("Name must be at least 4 and at most 100 characters long")
    .isString()
    .withMessage("Name must be a string"),

  body("description")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters")
    .isString()
    .withMessage("Description must be a string"),

  body("categories").isString().withMessage("Categories must be a string"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("estimatedPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated price must be a positive number"),

  body("thumbnail.public_id")
    .optional()
    .isString()
    .withMessage("Thumbnail public ID must be a string"),

  body("thumbnail.url")
    .optional()
    .isURL()
    .withMessage("Thumbnail URL must be a valid URL"),

  body("tags").isString().withMessage("Tags must be a string"),

  body("level").isString().withMessage("Level must be a string"),

  body("demoUrl").isURL().withMessage("Demo URL must be a valid URL"),

  body("benefits.*.title")
    .optional()
    .isString()
    .withMessage("Benefit title must be a string"),

  body("prerequisites.*.title")
    .optional()
    .isString()
    .withMessage("Prerequisite title must be a string"),

  body("ratings")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Ratings must be between 0 and 5"),

  body("purchased")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Purchased count must be a positive integer"),

  handleValidationErrors,
];
