import { NextFunction, Request, Response } from "express";

export const CatchAsyncError =
	(asyncFunc: any) =>
	(request: Request, response: Response, next: NextFunction) => {
		Promise.resolve(asyncFunc(request, response, next)).catch(next);
	};
