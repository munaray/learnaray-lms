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
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller";
import { validateUserRegistration } from "../middleware/validator/user.validator";
import { authorizeRoles, isAuthenticated } from "../middleware/authenticate";

const router = Router();

// Auth-related routes
router.post("/register", validateUserRegistration, userRegistration);
router.post("/users/activate", activateUser);
router.post("/login", userLogin);
router.delete("/logout", isAuthenticated, userLogout);
router.get("/refresh-token", updateAccessToken);
router.post("/auth/social", socialAuth);

// User-related routes
router.get("/me", isAuthenticated, getUserInfo);
router.patch("/users/me", isAuthenticated, updateUserInfo);
router.patch("/users/password", isAuthenticated, updatePassword);
router.patch("/users/avatar", isAuthenticated, updateProfilePicture);

// Admin-only routes
router.get("/users", isAuthenticated, authorizeRoles("admin"), getAllUsers);
router.patch(
  "/users/:id/role",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRole
);
router.delete(
  "/users/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser
);

export default router;
