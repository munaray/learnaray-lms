import { Router } from "express";
import { activateUser, userRegistration } from "../controllers/user.controller";
import { validateUserRegistration } from "../middleware/validator/user.validator";

const router = Router();

router.post("/sign-up", validateUserRegistration, userRegistration);
router.post("/activate-user", activateUser);

export default router;
