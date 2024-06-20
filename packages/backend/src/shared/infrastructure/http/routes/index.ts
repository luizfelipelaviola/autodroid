import { Router } from "express";

// Router import
import { healthCheckRouter } from "@modules/healthcheck/infrastructure/http/routes/healthCheck.routes";

const router = Router();

router.use("/health", healthCheckRouter);

export { router };
