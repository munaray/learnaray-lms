import express from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  getAdminAllCourses,
  getAllCourses,
  getFullCourseContent,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/authenticate";
import { validateCourseCreation } from "../middleware/validator/course.validator";

const router = express.Router();

// Course-related routes
router.post(
  "/courses",
  validateCourseCreation,
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);

router.patch(
  "/courses/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse
);

router.get("/courses/:id", getSingleCourse);
router.get("/courses", getAllCourses);

router.get(
  "/admin/courses",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminAllCourses
);

router.get("/courses/:id/content", isAuthenticated, getFullCourseContent);

// Question/Answer-related routes
router.post("/courses/:courseId/questions", isAuthenticated, addQuestion);
router.post(
  "/courses/:courseId/questions/:questionId/answers",
  isAuthenticated,
  addAnswer
);

// Review-related routes
router.post("/courses/:id/reviews", isAuthenticated, addReview);
router.post(
  "/courses/:courseId/reviews/:reviewId/reply",
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview
);

// Admin-only course deletion
router.delete(
  "/courses/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCourse
);

export default router;
