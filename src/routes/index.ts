import { Router } from "express";
import usersRouter from "./user.route";
import courseRouter from "./course.route";
import orderRouter from "./order.route";
import notificationRouter from "./notification.route";
import analyticsRouter from "./analytics.route";
import layoutRouter from "./layout.route";

const router = Router();

router.use(usersRouter);
router.use(courseRouter);
router.use(orderRouter);
router.use(notificationRouter);
router.use(analyticsRouter);
router.use(layoutRouter);

export default router;
