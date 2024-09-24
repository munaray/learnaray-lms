import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/authenticate";
import {
	getCoursesAnalytics,
	getOrderAnalytics,
	getUsersAnalytics,
} from "../controllers/analytics.controller";
const router = express.Router();

router.get(
	"/get-users-analytics",
	isAuthenticated,
	authorizeRoles("admin"),
	getUsersAnalytics
);

router.get(
	"/get-orders-analytics",
	isAuthenticated,
	authorizeRoles("admin"),
	getOrderAnalytics
);

router.get(
	"/get-courses-analytics",
	isAuthenticated,
	authorizeRoles("admin"),
	getCoursesAnalytics
);

export default router;
