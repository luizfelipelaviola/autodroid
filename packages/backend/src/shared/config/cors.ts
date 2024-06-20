// Configuration import
import { getEnvConfig } from "@config/env";

const getCorsConfig = () => ({
  origin:
    getEnvConfig().NODE_ENV === "production"
      ? getEnvConfig().CORS_ALLOWED_FROM.split(",")
      : "*",
});

export { getCorsConfig };
