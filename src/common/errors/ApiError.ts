interface IApiError {
  status: number
  message: string
  description?: string
}

export class ApiError extends Error implements IApiError {
  constructor (public status: number, public message: string, public description?: string) {
    super()
  }
}
