import { NextFunction, Request, Response } from "express";
import util from "node:util";
import Youch from "youch";
import * as Sentry from "@sentry/node";

// Error import
import { AppError } from "@shared/errors/AppError";

const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
): Promise<Response<any> | void> => {
  if (
    err instanceof AppError ||
    (err as any).handler === AppError.prototype.name
  ) {
    const appError = err as AppError;
    if (appError.key && appError.message)
      return res.status(appError.statusCode).json({
        code: appError.key,
        message: appError.message,
        ...(appError.debug && {
          fatal: true,
        }),
      });
    return res.status(appError.statusCode).send();
  }

  const errors = await new Youch(err, req).toJSON();

  if (String(errors.error?.message).includes("JSON"))
    return res.status(400).json({
      code: "@general/JSON_ERROR",
      message: "Your request has problems on the JSON structure.",
    });

  console.log(
    `❌ Application failure: `,
    util.inspect(errors, false, null, true),
  );

  Sentry.captureException(err);

  return res.status(500).json({
    code: "@general/INTERNAL_SERVER_ERROR",
    message: "Internal server error.",
    fatal: true,
  });
};

export { errorMiddleware };
