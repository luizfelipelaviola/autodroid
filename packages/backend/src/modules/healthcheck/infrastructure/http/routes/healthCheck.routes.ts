import { Router } from "express";

const healthCheckRouter = Router();

healthCheckRouter.get("/ready", (req, res) => res.status(200).send());
healthCheckRouter.get("/live", (req, res) => res.status(200).send());
healthCheckRouter.get("/check", (req, res) => res.status(200).send());

export { healthCheckRouter };
