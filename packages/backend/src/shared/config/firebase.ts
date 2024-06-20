// Configuration import
import { getEnvConfig } from "@config/env";

const getFirebaseAuthProviderConfig = () => ({
  project_id: String(
    getEnvConfig().FIREBASE_AUTHENTICATION_PROVIDER_PROJECT_ID,
  ),
  client_email: String(
    getEnvConfig().FIREBASE_AUTHENTICATION_PROVIDER_CLIENT_EMAIL,
  ),
  private_key: String(
    getEnvConfig().FIREBASE_AUTHENTICATION_PROVIDER_PRIVATE_KEY,
  ).replace(/\\n/g, "\n"),
});

export { getFirebaseAuthProviderConfig };
