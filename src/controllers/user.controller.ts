import { Request, Response, NextFunction } from "express";
import {
	UserTypes,
	RegistrationData,
	ActivationRequest,
	LoginRequest,
} from "../utils/types";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/asyncError";
import User from "../schema/user.schema";
import { createActivationToken } from "../utils/tokens";
import mailSender from "../utils/mailSender";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/tokens";
import { redis } from "../utils/redis";
import "dotenv/config";

// sign-up user
export const userRegistration = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const { name, email, password } = request.body;

			const isEmailExist = await User.findOne({ email });
			if (isEmailExist) {
				return next(new ErrorHandler("Email already exist", 400));
			}

			const user: RegistrationData = { name, email, password };

			const activationToken = createActivationToken(user);

			const activationCode = activationToken.activationCode;

			const data = { user: { name: user.name }, activationCode };

			try {
				await mailSender({
					email: user.email,
					subject: "Learnaray - Let's complete your account setup",
					template: "activation-mail.ejs",
					data,
				});

				response.status(201).send({
					success: true,
					message: `Please check your email: ${user.email} to activate your account`,
					activationToken: activationToken.token,
				});
			} catch (error: any) {
				return next(new ErrorHandler(error.message, 400));
			}
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 400));
		}
	}
);

// Activate user

export const activateUser = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const { userActivationToken, userActivationCode } =
				request.body as ActivationRequest;

			const newUser: { user: UserTypes; activationCode: string } =
				jwt.verify(
					userActivationToken,
					process.env.JWT_ACTIVATION_SECRET as string
				) as { user: UserTypes; activationCode: string };

			if (newUser.activationCode !== userActivationCode) {
				return next(new ErrorHandler("Invalid activation code", 400));
			}

			const { name, email, password } = newUser.user;

			const existUser = await User.findOne({ email });

			if (existUser) {
				return next(new ErrorHandler("Email exist already", 400));
			}
			await User.create({
				name,
				email,
				password,
			});

			response.status(201).send({
				success: true,
				message: "User activated successfully",
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 400));
		}
	}
);

export const userLogin = CatchAsyncError(
	async (request: Request, response: Response, next: NextFunction) => {
		try {
			const { email, password } = request.body as LoginRequest;

			if (!email || !password) {
				return next(
					new ErrorHandler(
						"Please enter your email and password",
						400
					)
				);
			}

			const user = await User.findOne({ email }).select("password");

			if (!user) {
				return next(new ErrorHandler("Invalid email or password", 400));
			}

			const isPasswordMatch = await user.comparePassword(password);

			if (!isPasswordMatch) {
				return next(new ErrorHandler("Invalid email or password", 400));
			}
			sendToken(user, 200, response);
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 400));
		}
	}
);

export const userLogout = CatchAsyncError(
	(request: Request, response: Response, next: NextFunction) => {
		try {
			response.cookie("userAccessToken", "", { maxAge: 1 });
			response.cookie("userRefreshToken", "", { maxAge: 1 });

			response.status(200).send({
				success: true,
				message: "You've logged out successfully",
			});
		} catch (error: any) {
			return next(new ErrorHandler(error.message, 400));
		}
	}
);
