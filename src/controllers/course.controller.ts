import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/errorHandler";
import { redis } from "../utils/redis";
import { CatchAsyncError } from "../middleware/asyncError";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";

// Upload course
export const uploadCourse = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const data = request.body;
			const thumbnail = data.thumbnail;

			if (thumbnail) {
				const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
					folder: "courses",
				});

				data.thumbnail = {
					public_id: myCloud.public_id,
					url: myCloud.secure_url,
				};
			}
			createCourse(data, response, next);
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);
