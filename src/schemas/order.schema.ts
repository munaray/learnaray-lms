import { OrderTypes } from "@/utils/types";

import mongoose, { Model, Schema } from "mongoose";

const orderSchema = new Schema<OrderTypes>(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    payment_info: {
      type: Object,
      // required: true
    },
  },
  { timestamps: true },
);

const Order: Model<OrderTypes> = mongoose.model("Order", orderSchema);

export default Order;
