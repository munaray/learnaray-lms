import { Document } from "mongoose";

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
