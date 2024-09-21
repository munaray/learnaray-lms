import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/errorHandler";
import { redis } from "../utils/redis";
import { CatchAsyncError } from "../middleware/asyncError";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import Course from "../schemas/course.schema";
import Notification from "../schemas/notification.schema";
import {
	AddAnswerDataType,
	AddQuestionDataType,
	AddReviewDataType,
} from "../@types/types.course";
import mongoose from "mongoose";
import mailSender from "../utils/mailSender";
import axios from "axios";

// Upload course
export const uploadCourse = CatchAsyncError(
	async (
		request: Request<{}, {}, any>,
		response: Response,
		next: NextFunction
	) => {
		try {
			const data = request.body;
			const thumbnail = data.thumbnail as string;

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

			// const courseId = request.params.id;

			// const courseData = (await Course.findById(courseId)) as any; && !thumbnail.startsWith("https")

			if (thumbnail) {
				await cloudinary.v2.uploader.destroy(thumbnail.public_id);

				const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
					folder: "courses",
				});

				data.thumbnail = {
					public_id: myCloud.public_id,
					url: myCloud.secure_url,
				};
			}

			// if (thumbnail.startsWith("https")) {
			// 	data.thumbnail = {
			// 		public_id: courseData?.thumbnail.public_id,
			// 		url: courseData?.thumbnail.url,
			// 	};
			// }
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
		response: Response,
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

			await Notification.create({
				user: request.user?._id,
				title: "New Question Received",
				message: `You have a new question in ${courseContent.title}`,
			});

			// save the updated course
			await course?.save();

			response.status(200).json({
				success: true,
				course,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// add answer in course question

export const addAnswer = CatchAsyncError(
	async (
		request: Request<{}, {}, AddAnswerDataType>,
		response: Response,
		next: NextFunction
	) => {
		try {
			const { answer, courseId, contentId, questionId } = request.body;

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

			const question = courseContent?.questions?.find((item: any) =>
				item._id.equals(questionId)
			);

			if (!question) {
				return next(new ErrorHandler("Invalid question id", 400));
			}

			// create a new answer object
			const newAnswer: any = {
				user: request.user,
				answer,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// add this answer to our course content
			question.questionReplies.push(newAnswer);

			await course?.save();

			if (request.user?._id === question.user._id) {
				// create a notification
				await Notification.create({
					user: request.user?._id,
					title: "New Question Reply Received",
					message: `You have a new question reply in ${courseContent.title}`,
				});
			} else {
				const data = {
					name: question.user.name,
					title: courseContent.title,
				};

				try {
					await mailSender({
						email: question.user.email,
						subject: "Question Reply",
						template: "question-reply.ejs",
						data,
					});
				} catch (error: any) {
					return next(new ErrorHandler(error.message, 500));
				}
			}

			response.status(200).json({
				success: true,
				course,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// add review in course
export const addReview = CatchAsyncError(
	async (
		request: Request<{ id: string }, {}, AddReviewDataType>,
		response: Response,
		next: NextFunction
	) => {
		try {
			const userCourseList = request.user?.courses;

			const courseId = request.params.id;

			// check if courseId already exists in userCourseList based on _id
			const courseExists = userCourseList?.some(
				(course: any) => course._id.toString() === courseId.toString()
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

			const { review, rating } = request.body;

			const reviewData: any = {
				user: request.user,
				rating,
				comment: review,
			};

			course?.reviews.push(reviewData);

			let avg = 0;

			course?.reviews.forEach((rev: any) => {
				avg += rev.rating;
			});

			if (course) {
				course.ratings = avg / course.reviews.length; // one example we have 2 reviews one is 5 another one is 4 so math working like this = 9 / 2  = 4.5 ratings
			}

			await course?.save();

			await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

			// create notification
			await Notification.create({
				user: request.user?._id,
				title: "New Review Received",
				message: `${request.user?.name} has given a review in ${course?.name}`,
			});

			response.status(200).json({
				success: true,
				course,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// add reply in review
export const addReplyToReview = CatchAsyncError(
	async (
		request: Request<{}, {}, AddReviewDataType>,
		response: Response,
		next: NextFunction
	) => {
		try {
			const { comment, courseId, reviewId } = request.body;

			const course = await Course.findById(courseId);

			if (!course) {
				return next(new ErrorHandler("Course not found", 404));
			}

			const review = course?.reviews?.find(
				(rev: any) => rev._id.toString() === reviewId
			);

			if (!review) {
				return next(new ErrorHandler("Review not found", 404));
			}

			const replyData: any = {
				user: request.user,
				comment,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (!review.commentReplies) {
				review.commentReplies = [];
			}

			review.commentReplies?.push(replyData);

			await course?.save();

			await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

			response.status(200).json({
				success: true,
				course,
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 500));
		}
	}
);

// get all courses --- only for admin
export const getAdminAllCourses = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			getAllCoursesService(response);
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 400));
		}
	}
);

// Delete Course --- only for admin
export const deleteCourse = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const { id } = request.params;

			const course = await Course.findById(id);

			if (!course) {
				return next(new ErrorHandler("course not found", 404));
			}

			await course.deleteOne({ id });

			await redis.del(id);

			response.status(200).json({
				success: true,
				message: "course deleted successfully",
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 400));
		}
	}
);

// generate video url
export const generateVideoUrl = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const { videoId } = request.body;
			const responseReturn = await axios.post(
				`https://dev.vdocipher.com/api/videos/${videoId}/otp`,
				{ ttl: 300 },
				{
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
					},
				}
			);
			response.send(responseReturn.data);
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 400));
		}
	}
);
