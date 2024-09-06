import { Response } from "express-serve-static-core";
import CourseModel from "../schemas/course.schema";
import { CatchAsyncError } from "../middleware/asyncError";

// Create course
export const createCourse = CatchAsyncError(
	async (data: any, response: Response) => {
		const course = await CourseModel.create(data);
		response.status(201).send({
			success: true,
			course,
		});
	}
);
