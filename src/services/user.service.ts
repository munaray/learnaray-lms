import { Response } from "express-serve-static-core";
import { redis } from "../utils/redis";

// get user by id
export const getUserById = async (id: string, response: Response) => {
	const redisUser = await redis.get(id);

	if (redisUser) {
		const user = JSON.parse(redisUser);

		response.status(200).send({
			success: true,
			user,
		});
	}
};
