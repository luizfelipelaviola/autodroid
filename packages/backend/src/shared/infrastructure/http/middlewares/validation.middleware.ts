import { NextFunction, Request, Response } from "express";
import { validateOrReject, ValidationError } from "class-validator";
import { ClassConstructor, plainToInstance } from "class-transformer";

// i18n import
import { TFunction } from "@shared/i18n";

// Error import
import { AppError } from "@shared/errors/AppError";

const Segments = {
  BODY: "body",
  COOKIES: "cookies",
  HEADERS: "headers",
  PARAMS: "params",
  QUERY: "query",
  SIGNEDCOOKIES: "signedCookies",
} as const;

async function validateSchema<T extends object>(params: {
  value: any;
  t: TFunction;
  schema: ClassConstructor<T>;
}) {
  const { t, schema, value } = params;

  Object.assign(value, plainToInstance(schema, value));

  try {
    await validateOrReject(value);
  } catch (err) {
    if (err instanceof ValidationError)
      throw new AppError({
        key: "@general/VALIDATION_FAIL",
        message:
          err.constraints?.[0] ||
          t("@general/VALIDATION_FAIL", "Validation error."),
      });
    throw new AppError({
      key: "@general/VALIDATION_FATAL_FAILURE",
      message: t(
        "@general/VALIDATION_FATAL_FAILURE",
        "Validation fatal server failure.",
      ),
      statusCode: 500,
    });
  }
}

function validationMiddleware<T extends object>(params: {
  schema: ClassConstructor<T>;
  segment: keyof typeof Segments;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validateSchema({
      value: req[Segments[params.segment]],
      t: req.t,
      schema: params.schema,
    });
    next();
  };
}

const validateRequest = validationMiddleware;

export { Segments, validateSchema, validateRequest };
