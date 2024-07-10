import { Router } from "express";
import usersRouter from "./user.route";

const router = Router();

router.use(usersRouter);

export default router;
