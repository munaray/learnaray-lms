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
const courseRouter = express.Router();

courseRouter.post(
	"/create-course",
	validateCourseCreation,
	isAuthenticated,
	authorizeRoles("admin"),
	uploadCourse
);

courseRouter.put(
	"/edit-course/:id",
	isAuthenticated,
	authorizeRoles("admin"),
	editCourse
);

courseRouter.get("/get-course/:id", getSingleCourse);

courseRouter.get("/user-get-courses", getAllCourses);

courseRouter.get(
	"/admin-get-courses",
	isAuthenticated,
	authorizeRoles("admin"),
	getAdminAllCourses
);

courseRouter.get(
	"/get-course-content/:id",
	isAuthenticated,
	getFullCourseContent
);

courseRouter.put("/add-question", isAuthenticated, addQuestion);

courseRouter.put("/add-answer", isAuthenticated, addAnswer);

courseRouter.put("/add-review/:id", isAuthenticated, addReview);

courseRouter.put(
	"/reply-review",
	isAuthenticated,
	authorizeRoles("admin"),
	addReplyToReview
);

courseRouter.post("/getVdoCipherOTP", generateVideoUrl);

courseRouter.delete(
	"/delete-course/:id",
	isAuthenticated,
	authorizeRoles("admin"),
	deleteCourse
);

export default courseRouter;
