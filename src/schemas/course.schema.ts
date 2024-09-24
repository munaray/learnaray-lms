import {
	CommentTypes,
	CourseDataTypes,
	CourseTypes,
	LinkTypes,
	ReviewTypes,
} from "../utils/types";
import mongoose, { Model, Schema } from "mongoose";

const reviewSchema = new Schema<ReviewTypes>(
	{
		user: Object,
		rating: {
			type: Number,
			default: 0,
		},
		comment: String,
		commentReplies: [Object],
	},
	{ timestamps: true }
);

const linkSchema = new Schema<LinkTypes>({
	title: String,
	url: String,
});

const commentSchema = new Schema<CommentTypes>(
	{
		user: Object,
		question: String,
		questionReplies: [Object],
	},
	{ timestamps: true }
);

const courseDateSchema = new Schema<CourseDataTypes>({
	videoUrl: String,
	title: String,
	videoSection: String,
	description: String,
	videoLength: Number,
	videoPlayer: String,
	links: [linkSchema],
	suggestion: String,
	questions: [commentSchema],
});

const CourseSchema = new Schema<CourseTypes>(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		categories: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		estimatedPrice: {
			type: Number,
		},
		thumbnail: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},
		tags: {
			type: String,
			required: true,
		},
		level: {
			type: String,
			required: true,
		},
		demoUrl: {
			type: String,
			required: true,
		},
		benefits: [{ title: String }],
		prerequisites: [{ title: String }],
		reviews: [reviewSchema],
		courseData: [courseDateSchema],
		ratings: {
			type: Number,
			default: 0,
		},
		purchased: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Course: Model<CourseTypes> = mongoose.model("Course", CourseSchema);

export default Course;
