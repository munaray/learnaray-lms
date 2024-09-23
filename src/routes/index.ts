import { Router } from "express";
import usersRouter from "./user.route";
import courseRouter from "./course.route";
import orderRouter from "./order.route";

const router = Router();

router.use(usersRouter);
router.use(courseRouter);
router.use(orderRouter);

export default router;
