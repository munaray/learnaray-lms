import express from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAdminAllCourses,
  getAllCourses,
  getFullCourseContent,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/authenticate";
import { validateCourseCreation } from "../middleware/validator/course.validator";
const router = express.Router();

router.post(
  "/create-course",
  validateCourseCreation,
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse,
);

router.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse,
);

router.get("/get-course/:id", getSingleCourse);

router.get("/user-get-courses", getAllCourses);

router.get(
  "/admin-get-courses",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminAllCourses,
);

router.get("/get-course-content/:id", isAuthenticated, getFullCourseContent);

router.put("/add-question", isAuthenticated, addQuestion);

router.put("/add-answer", isAuthenticated, addAnswer);

router.put("/add-review/:id", isAuthenticated, addReview);

router.put(
  "/reply-review",
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview,
);

router.post("/getVdoCipherOTP", generateVideoUrl);

router.delete(
  "/delete-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCourse,
);

export default router;
