import { Router } from "express";
import {
	activateUser,
	userRegistration,
	userLogin,
	userLogout,
	updateAccessToken,
	getUserInfo,
	socialAuth,
} from "../controllers/user.controller";
import { validateUserRegistration } from "../middleware/validator/user.validator";
import { authorizeRoles, isAuthenticated } from "../middleware/authenticate";

const router = Router();

router.post("/signup", validateUserRegistration, userRegistration);
router.post("/activate", activateUser);
router.post("/login", userLogin);
router.post("/logout", isAuthenticated, userLogout);
router.get("/refresh", updateAccessToken);
router.get("/me", isAuthenticated, getUserInfo);
router.post("/socialAuth", socialAuth);

export default router;
