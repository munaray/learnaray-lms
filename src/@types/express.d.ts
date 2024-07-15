import * as express from "express-serve-static-core";
import { UserTypes } from "@/utils/types";

declare global {
	namespace Express {
		interface Request {
			user?: UserTypes;
		}
	}
}
