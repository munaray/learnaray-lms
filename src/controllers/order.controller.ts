import { Request, Response, NextFunction } from "express-serve-static-core";
import { CatchAsyncError } from "../middleware/asyncError";
import ErrorHandler from "../utils/errorHandler";
import { OrderType } from "../utils/types";
import User from "../schemas/user.schema";
import Course from "../schemas/course.schema";
import mailSender from "../utils/mailSender";
import Notification from "../schemas/notification.schema";
import { redis } from "../utils/redis";
import Order from "../schemas/order.schema";
import "dotenv/config";
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create order
export const createOrder = CatchAsyncError(
	async (
		request: Request<{}, {}, OrderType>,
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
					new ErrorHandler(
						"You have already purchased this course",
						400
					)
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

// // create order for mobile
// export const createMobileOrder = CatchAsyncError(
// 	async (request: Request, response: Response, next: NextFunction) => {
// 		try {
// 			const { courseId, payment_info } = request.body as IOrder;
// 			const user = await userModel.findById(request.user?._id);

// 			const courseExistInUser = user?.courses.some(
// 				(course: any) => course._id.toString() === courseId
// 			);

// 			if (courseExistInUser) {
// 				return next(
// 					new ErrorHandler(
// 						"You have already purchased this course",
// 						400
// 					)
// 				);
// 			}

// 			const course: ICourse | null = await CourseModel.findById(courseId);

// 			if (!course) {
// 				return next(new ErrorHandler("Course not found", 404));
// 			}

// 			const data: any = {
// 				courseId: course._id,
// 				userId: user?._id,
// 				payment_info,
// 			};

// 			const mailData = {
// 				order: {
// 					_id: course._id.toString().slice(0, 6),
// 					name: course.name,
// 					price: course.price,
// 					date: new Date().toLocaleDateString("en-US", {
// 						year: "numeric",
// 						month: "long",
// 						day: "numeric",
// 					}),
// 				},
// 			};

// 			const html = await ejs.renderFile(
// 				path.join(__dirname, "../mails/order-confirmation.ejs"),
// 				{ order: mailData }
// 			);

// 			try {
// 				if (user) {
// 					await sendMail({
// 						email: user.email,
// 						subject: "Order Confirmation",
// 						template: "order-confirmation.ejs",
// 						data: mailData,
// 					});
// 				}
// 			} catch (error: any) {
// 				return next(new ErrorHandler(error.message, 500));
// 			}

// 			user?.courses.push(course?._id);

// 			await redis.set(request.user?._id, JSON.stringify(user));

// 			await user?.save();

// 			await NotificationModel.create({
// 				user: user?._id,
// 				title: "New Order",
// 				message: `You have a new order from ${course?.name}`,
// 			});

// 			course.purchased = course.purchased + 1;

// 			await course.save();

// 			newOrder(data, response, next);
// 		} catch (error: any) {
// 			return next(new ErrorHandler(error.message, 500));
// 		}
// 	}
// );

// get All orders --- only for admin
// export const getAllOrders = CatchAsyncError(
// 	async (request: Request, response: Response, next: NextFunction) => {
// 		try {
// 			getAllOrdersService(response);
// 		} catch (error: any) {
// 			return next(new ErrorHandler(error.message, 500));
// 		}
// 	}
// );

//  send stripe publishble key
// export const sendStripePublishableKey = CatchAsyncError(
// 	async (request: Request, response: Response) => {
// 		response.status(200).json({
// 			publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
// 		});
// 	}
// );

// new payment
// export const newPayment = CatchAsyncError(
// 	async (request: Request, response: Response, next: NextFunction) => {
// 		try {
// 			const myPayment = await stripe.paymentIntents.create({
// 				amount: request.body.amount,
// 				currency: "GBP",
// 				metadata: {
// 					company: "E-Learning",
// 				},
// 				automatic_payment_methods: {
// 					enabled: true,
// 				},
// 			});

// 			response.status(201).json({
// 				success: true,
// 				client_secret: myPayment.client_secret,
// 			});
// 		} catch (error: any) {
// 			return next(new ErrorHandler(error.message, 500));
// 		}
// 	}
// );
