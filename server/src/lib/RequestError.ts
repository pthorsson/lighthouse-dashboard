export class RequestError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'RequestError';
    this.statusCode = statusCode;
  }
}
