interface IAppError {
  key: string
  message: string
  statusCode?: number
  debug?: Record<string, any>
}

class AppError extends Error {
  public readonly key: string
  public readonly message: string
  public readonly statusCode: number
  public readonly debug?: Record<string, any>

  constructor(params: IAppError) {
    super(params.message)
    Object.setPrototypeOf(this, AppError.prototype)

    this.key = params.key
    this.name = params.key

    this.message = params.message
    this.statusCode = params.statusCode
      ? params.statusCode
      : params.debug
      ? 500
      : 400

    this.debug = params.debug
  }
}

export { AppError }
