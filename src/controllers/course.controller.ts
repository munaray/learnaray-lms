import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/errorHandler";
import { redis } from "../utils/redis";
import { CatchAsyncError } from "../middleware/asyncError";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import Course from "../schemas/course.schema";
import { AddQuestionDataType } from "../@types/types.course";
import mongoose from "mongoose";

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

// edit course
export const editCourse = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const data = request.body;

			const thumbnail = data.thumbnail;

			const courseId = request.params.id;

			const courseData = (await Course.findById(courseId)) as any;

			if (thumbnail && !thumbnail.startsWith("https")) {
				await cloudinary.v2.uploader.destroy(
					courseData.thumbnail.public_id
				);

				const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
					folder: "courses",
				});

				data.thumbnail = {
					public_id: myCloud.public_id,
					url: myCloud.secure_url,
				};
			}

			if (thumbnail.startsWith("https")) {
				data.thumbnail = {
					public_id: courseData?.thumbnail.public_id,
					url: courseData?.thumbnail.url,
				};
			}

			const course = await Course.findByIdAndUpdate(
				courseId,
				{
					$set: data,
				},
				{ new: true }
			);

			response.status(201).send({
				success: true,
				course,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const courseId = request.params.id;

			const isCacheExist = await redis.get(courseId);

			if (isCacheExist) {
				const course = JSON.parse(isCacheExist);
				response.status(200).send({
					success: true,
					course,
				});
			} else {
				const course = await Course.findById(request.params.id).select(
					"-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
				);

				await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

				response.status(200).json({
					success: true,
					course,
				});
			}
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// get all courses --- without purchasing
export const getAllCourses = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const courses = await Course.find().select(
				"-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
			);

			response.status(200).json({
				success: true,
				courses,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const userCourseList = request.user?.courses;
			const courseId = request.params.id;

			const courseExists = userCourseList?.find(
				(course: any) => course._id.toString() === courseId
			);

			if (!courseExists) {
				return next(
					new ErrorHandler(
						"You are not eligible to access this course",
						404
					)
				);
			}

			const course = await Course.findById(courseId);

			const content = course?.courseData;

			response.status(200).json({
				success: true,
				content,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

export const addQuestion = CatchAsyncError(
	async (
		request: Request<{}, {}, AddQuestionDataType>,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { question, courseId, contentId } = request.body;

			const course = await Course.findById(courseId);

			if (!mongoose.Types.ObjectId.isValid(contentId)) {
				return next(new ErrorHandler("Invalid content id", 400));
			}

			const courseContent = course?.courseData?.find((item: any) =>
				item._id.equals(contentId)
			);

			if (!courseContent) {
				return next(new ErrorHandler("Invalid content id", 400));
			}

			// create a new question object
			const newQuestion: any = {
				user: request.user,
				question,
				questionReplies: [],
			};

			// add this question to our course content
			courseContent.questions.push(newQuestion);

			await NotificationModel.create({
				user: request.user?._id,
				title: "New Question Received",
				message: `You have a new question in ${courseContent.title}`,
			});

			// save the updated course
			await course?.save();

			res.status(200).json({
				success: true,
				course,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);