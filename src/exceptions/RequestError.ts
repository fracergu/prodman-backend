export class RequestError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message)
  }
}
