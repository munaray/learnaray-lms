import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/authenticate";
import {
  // createMobileOrder,
  createOrder,
  getAllOrders,
  // newPayment,
  // sendStripePublishableKey,
} from "../controllers/order.controller";
const router = express.Router();

router.post("/create-order", isAuthenticated, createOrder);

// router.post("/create-mobile-order", isAuthenticated, createMobileOrder);

router.get(
  "/get-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrders,
);

// router.get("/payment/stripepublishablekey", sendStripePublishableKey);

// router.post("/payment", isAuthenticated, newPayment);

export default router;
