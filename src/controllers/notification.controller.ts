import Notification from "../schemas/notification.schema";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/asyncError";
import ErrorHandler from "../utils/errorHandler";
import cron from "node-cron";

// get all notifications --- only admin
export const getNotifications = CatchAsyncError(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const notifications = await Notification.find().sort({
				createdAt: -1,
			});

			res.status(201).json({
				success: true,
				notifications,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// update notification status --- only admin
export const updateNotification = CatchAsyncError(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const notification = await Notification.findById(req.params.id);
			if (!notification) {
				return next(new ErrorHandler("Notification not found", 404));
			} else {
				notification.status
					? (notification.status = "read")
					: notification?.status;
			}

			await notification.save();

			const notifications = await Notification.find().sort({
				createdAt: -1,
			});

			res.status(201).json({
				success: true,
				notifications,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// delete notification --- only admin
cron.schedule("0 0 0 * * *", async () => {
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	await Notification.deleteMany({
		status: "read",
		createdAt: { $lt: thirtyDaysAgo },
	});
	console.log("Deleted read notifications");
});
