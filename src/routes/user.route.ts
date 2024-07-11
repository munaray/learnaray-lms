import { Router } from "express";
import {
	activateUser,
	userRegistration,
	userLogin,
	userLogout,
} from "../controllers/user.controller";
import { validateUserRegistration } from "../middleware/validator/user.validator";

const router = Router();

router.post("/signup", validateUserRegistration, userRegistration);
router.post("/activate", activateUser);
router.post("/login", userLogin);
router.get("/logout", userLogout);

export default router;
