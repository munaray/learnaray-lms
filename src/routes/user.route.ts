import { Router } from "express";
import {
	activateUser,
	userRegistration,
	userLogin,
	userLogout,
	updateAccessToken,
	getUserInfo,
	socialAuth,
	updateUserInfo,
	updatePassword,
	updateProfilePicture,
} from "../controllers/user.controller";
import { validateUserRegistration } from "../middleware/validator/user.validator";
import { authorizeRoles, isAuthenticated } from "../middleware/authenticate";

const router = Router();

router.post("/signup", validateUserRegistration, userRegistration);
router.post("/activate-user", activateUser);
router.post("/login", userLogin);
router.post("/logout", isAuthenticated, userLogout);
router.get("/refresh-token", updateAccessToken);
router.get("/me", isAuthenticated, getUserInfo);
router.post("/social-auth", socialAuth);
router.put("/update-user-info", isAuthenticated, updateUserInfo);
router.put("/update-user-password", isAuthenticated, updatePassword);
router.put("/update-user-avatar", isAuthenticated, updateProfilePicture);

export default router;
