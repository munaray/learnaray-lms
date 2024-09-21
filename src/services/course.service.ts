import { Response } from "express-serve-static-core";
import Course from "../schemas/course.schema";
import { CatchAsyncError } from "../middleware/asyncError";
import { CourseType } from "../@types/types.course";

// Create course
export const createCourse = CatchAsyncError(
	async (data: CourseType, response: Response) => {
		const course = await Course.create(data);
		response.status(201).send({
			success: true,
			course,
		});
	}
);

// Get All Courses
export const getAllCoursesService = async (response: Response) => {
	const courses = await Course.find().sort({ createdAt: -1 });

	response.status(201).json({
		success: true,
		courses,
	});
};
