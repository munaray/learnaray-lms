import { Request, Response, NextFunction } from "express-serve-static-core";
import { CatchAsyncError } from "../middleware/asyncError";
import ErrorHandler from "../utils/errorHandler";
import { OrderTypes } from "../utils/types";
import User from "../schemas/user.schema";
import Course from "../schemas/course.schema";
import mailSender from "../utils/mailSender";
import Notification from "../schemas/notification.schema";
import { redis } from "../utils/redis";
import Order from "../schemas/order.schema";
import "dotenv/config";

// create order
export const createOrder = CatchAsyncError(
  async (
    request: Request<{}, {}, OrderTypes>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = request.body;

      const user = await User.findById(request.user._id);
      if (!user) {
        return next(new ErrorHandler("User does not exist", 404));
      }

      const userHasCourse = user.courses.some(
        (course: any) => course.id === courseId
      );

      if (userHasCourse) {
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );
      }

      const course = await Course.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      user.courses.push(course.id);

      await redis.set(request.user.id, JSON.stringify(user));

      await user.save();

      if (course.purchased) course.purchased += 1;

      await course.save();

      await Notification.create({
        user: user.id,
        title: "New Order",
        message: `You have a new order from ${course.name}`,
      });

      const order = await Order.create({
        courseId: course.id,
        userId: user.id,
        payment_info: {},
      });

      const data = {
        name: user.name,
        order: {
          _id: course.id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      try {
        if (user) {
          await mailSender({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      response.status(201).send({
        success: true,
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get All orders
export const getAllOrders = CatchAsyncError(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const order = await Order.find().sort({ createdAt: -1 });

      response.status(200).send({
        success: true,
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
