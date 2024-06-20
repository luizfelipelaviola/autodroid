// Configuration import
import { getEnvConfig } from "@config/env";

const getAdminConfig = () => ({
  emails: (getEnvConfig().ADMIN_EMAILS || "").split(","),
});

export { getAdminConfig };
