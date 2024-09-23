import { Router } from "express";
import usersRouter from "./user.route";
import courseRouter from "./course.route";
import orderRouter from "./order.route";
import notificationRouter from "./notification.route";

const router = Router();

router.use(usersRouter);
router.use(courseRouter);
router.use(orderRouter);
router.use(notificationRouter);

export default router;
