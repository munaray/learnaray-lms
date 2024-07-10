import { Response } from "express";
import {
	ActivationToken,
	RegistrationData,
	UserTypes,
	TokenOptions,
} from "./types";
import jwt, { Secret } from "jsonwebtoken";
import { redis } from "./redis";
import "dotenv/config";

export const createActivationToken = (
	user: RegistrationData
): ActivationToken => {
	const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

	const token = jwt.sign(
		{
			user,
			activationCode,
		},
		process.env.JWT_ACTIVATION_SECRET as Secret,
		{
			expiresIn: "10m",
		}
	);

	return { token, activationCode };
};

const accessTokenExpire = parseInt(
	process.env.JWT_ACCESS_TOKEN_EXPIRE || "300",
	10
);
const refreshTokenExpire = parseInt(
	process.env.JWT_REFRESH_TOKEN_EXPIRE || "1200",
	10
);

// cookies options

export const accessTokenOptions: TokenOptions = {
	maxAge: accessTokenExpire * 60 * 60 * 1000,
	expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
	httpOnly: true,
	sameSite: "none",
	secure: true,
};

export const refreshTokenOptions: TokenOptions = {
	maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
	expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
	httpOnly: true,
	sameSite: "none",
	secure: true,
};

export const sendToken = (
	user: UserTypes,
	statusCode: number,
	response: Response
) => {
	const accessToken = user.SignAccessToken();
	const refreshToken = user.SignRefreshToken();

	// upload session to redis
	redis.set(String(user._id), JSON.stringify(user));

	response.status(statusCode).send({
		success: true,
		user,
		accessToken,
		refreshToken,
	});
};
