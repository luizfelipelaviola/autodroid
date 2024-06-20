// Configuration import
import { getEnvConfig } from "@config/env";

// Util import
import { sleep } from "@shared/utils/sleep";

interface IParams {
  actionName: string;
  action: () => Promise<any>;
  attempt?: number;
  maxAttempts?: number;
  retryDelay?: number;
  logging?: boolean;
}

const executeAction = async (params: IParams): Promise<any> => {
  const {
    actionName,
    action,
    attempt = 1,
    maxAttempts = getEnvConfig().isTestEnv ? 0 : 3,
    logging,
  } = params;

  try {
    const result = await action();
    if (logging && !getEnvConfig().isTestEnv)
      console.log(
        attempt > 1
          ? `🆗 ${actionName} success with attempt ${attempt} ❎. `
          : `🆗 ${actionName} success.`,
      );
    return result;
  } catch (err: any) {
    if (attempt > maxAttempts)
      throw new Error(
        `❌ ${actionName} failure after ${
          attempt - 1
        } retries. ${err?.message}`,
      );

    if (logging)
      console.log(
        `❌ ${actionName} attempt ${attempt} failed. 🔄 Retrying... ${err.message} `,
      );
    await sleep(params.retryDelay || 5000);
    return executeAction({
      ...params,
      attempt: attempt + 1,
    });
  }
};

export { executeAction };
