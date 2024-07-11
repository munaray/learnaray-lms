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


export const sendToken = async (
	user: UserTypes,
	statusCode: number,
	response: Response
) => {
	const accessToken = user.SignAccessToken();
	const refreshToken = user.SignRefreshToken();

	// upload session to redis
	redis.set(user.id, JSON.stringify(user));

	const accessTokenExpire = parseInt(
		process.env.JWT_ACCESS_TOKEN_EXPIRE || "300",
		10
	);
	const refreshTokenExpire = parseInt(
		process.env.JWT_REFRESH_TOKEN_EXPIRE || "1200",
		10
	);

	// cookies options

	const accessTokenOptions: TokenOptions = {
		maxAge: accessTokenExpire * 60 * 60 * 1000,
		expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
		httpOnly: true,
		sameSite: "lax",
	};

	const refreshTokenOptions: TokenOptions = {
		maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
		expires: new Date(
			Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
		sameSite: "lax",
	};

	// secure true in production
	if (process.env.NODE_ENV) {
		accessTokenOptions.secure = true;
	}

	response.cookie("userAccessToken", accessToken, accessTokenOptions);
	response.cookie("userRefreshToken", refreshToken, refreshTokenOptions);

	response.status(statusCode).send({
		success: true,
		user,
		accessToken,
	});
};
