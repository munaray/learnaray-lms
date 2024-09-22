import { OrderType } from "@/utils/types";

import mongoose, { Model, Schema } from "mongoose";

const orderSchema = new Schema<OrderType>(
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
	{ timestamps: true }
);

const Order: Model<OrderType> = mongoose.model("Order", orderSchema);

export default Order;
