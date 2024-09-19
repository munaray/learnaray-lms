import { Document } from "mongoose";
import { UserTypes } from "./types.user";

export interface CommentType extends Document {
	user: UserTypes;
	question: string;
	questionReplies: CommentType[];
}

export interface ReviewType extends Document {
	user: UserTypes;
	rating?: number;
	comment: string;
	commentReplies?: ReviewType[];
}

export interface LinkType extends Document {
	title: string;
	url: string;
}

export interface CourseDataType extends Document {
	title: string;
	description: string;
	videoUrl: string;
	videoThumbnail: object;
	videoSection: string;
	videoLength: number;
	videoPlayer: string;
	links: LinkType[];
	suggestion: string;
	questions: CommentType[];
}

export interface CourseType extends Document {
	name: string;
	description: string;
	categories: string;
	price: number;
	estimatedPrice?: number;
	thumbnail: object;
	tags: string;
	level: string;
	demoUrl: string;
	benefits: { title: string }[];
	prerequisites: { title: string }[];
	reviews: ReviewType[];
	courseData: CourseDataType[];
	ratings?: number;
	purchased: number;
}

export interface AddReviewDataType {
	review: string;
	rating: number;
	userId: string;
}

export interface AddReviewDataType {
	comment: string;
	courseId: string;
	reviewId: string;
}

export interface AddQuestionDataType {
	question: string;
	courseId: string;
	contentId: string;
}
