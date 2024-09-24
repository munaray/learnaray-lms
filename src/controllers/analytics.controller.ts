import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/asyncError";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import User from "../schemas/user.schema";
import Course from "../schemas/course.schema";
import Order from "../schemas/order.schema";

// get users analytics --- only for admin
export const getUsersAnalytics = CatchAsyncError(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData(User);

      response.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get courses analytics --- only for admin
export const getCoursesAnalytics = CatchAsyncError(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const courses = await generateLast12MonthsData(Course);

      response.status(200).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get order analytics --- only for admin
export const getOrderAnalytics = CatchAsyncError(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const orders = await generateLast12MonthsData(Order);

      response.status(200).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
