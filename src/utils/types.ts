import { Document } from "mongoose";
import { Request } from "express-serve-static-core";

/* USER TYPES */
export interface UserTypes extends Document {
	name: string;
	email: string;
	password: string;
	avatar: {
		public_id: string;
		url: string;
	};
	role: string;
	isVerified: boolean;
	courses: Array<{ courseId: string }>;
	comparePassword: (plain: string) => Promise<boolean>;
	SignAccessToken: () => string;
	SignRefreshToken: () => string;
}

export interface RegistrationData {
	name: string;
	email: string;
	password: string;
	avatar?: string;
}

export interface NewUser {
	user: UserTypes;
	activationCode: string;
}

export interface ActivationPayload {
	user: UserTypes;
	activationCode: string;
}

export interface ActivationToken {
	token: string;
	activationCode: string;
}

export interface ActivationRequest {
	userActivationToken: string;
	userActivationCode: string;
}

export interface EmailOptions {
	email: string;
	subject: string;
	template: string;
	data: { [key: string]: any };
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface TokenOptions {
	maxAge: number;
	expires: Date;
	httpOnly: boolean;
	secure?: boolean;
	sameSite: "lax" | "strict" | "none" | undefined;
}

export interface SocialAuthBody {
	email: string;
	name: string;
	avatar: string;
}

export interface UpdateUserInfo {
	name?: string;
	email?: string;
}

export interface UpdatePassword {
	oldPassword: string;
	newPassword: string;
}

export interface UpdateProfilePicture {
	avatar: string;
}

export interface NotificationOptions extends Document {
	title: string;
	message: string;
	status: string;
	userId: string;
}

/* COURSE TYPES */

export interface CommentType extends Document {
	user: UserTypes;
	question: string;
	questionReplies: CommentType[];
}

export interface ReviewType extends Document {
	user?: UserTypes;
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
	comment: string;
	courseId: string;
	reviewId: string;
}

export interface AddQuestionDataType {
	question: string;
	courseId: string;
	contentId: string;
}

export interface AddAnswerDataType {
	answer: string;
	courseId: string;
	contentId: string;
	questionId: string;
}
