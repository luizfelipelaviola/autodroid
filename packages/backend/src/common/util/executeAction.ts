import { sleep } from '@common/util/sleep'

interface IParams {
  actionName: string
  action: () => Promise<any>
  attempt?: number
  maxAttempts?: number
  retryDelay?: number
  logging?: boolean
}

const executeAction = async (params: IParams): Promise<any> => {
  const { actionName, action, attempt = 1, maxAttempts = 3, logging } = params

  try {
    const result = await action()
    if (logging)
      console.log(
        attempt > 1
          ? `🆗 ${actionName} success with attempt ${attempt} ❎. `
          : `🆗 ${actionName} success.`,
      )
    return result
  } catch (err: any) {
    if (attempt > maxAttempts)
      throw new Error(
        `❌ ${actionName} failure after ${
          attempt - 1
        } retries. ${err?.message}`,
      )

    if (logging)
      console.log(
        `❌ ${actionName} attempt ${attempt} failed. 🔄 Retrying... ${err.message} `,
      )
    await sleep(params.retryDelay || 5000)
    return executeAction({
      ...params,
      attempt: attempt + 1,
    })
  }
}

export { executeAction }
