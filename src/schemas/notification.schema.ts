import mongoose, { Document, Model, Schema } from "mongoose";
import { NotificationOptionTypes } from "../utils/types";
const notificationSchema = new Schema<NotificationOptionTypes>(
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
  { timestamps: true },
);

const Notification: Model<NotificationOptionTypes> = mongoose.model(
  "Notification",
  notificationSchema,
);

export default Notification;
