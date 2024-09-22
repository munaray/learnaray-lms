import mongoose, { Document, Model, Schema } from "mongoose";
import { NotificationOptions } from "../utils/types";
const notificationSchema = new Schema<NotificationOptions>(
	{
		title: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			default: "unread",
		},
	},
	{ timestamps: true }
);

const Notification: Model<NotificationOptions> = mongoose.model(
	"Notification",
	notificationSchema
);

export default Notification;
