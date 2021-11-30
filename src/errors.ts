export abstract class HttpError extends Error {
  abstract statusCode: number;
  abstract message: string;
}

export class UnauthorizedError extends HttpError {
  statusCode: number = 401;
  message: string = "Unauthorized";
}

export class NotFoundError extends HttpError {
  statusCode: number = 404;
  message: string = "Not Found";
}

export class MethodNotAllowedError extends HttpError {
  statusCode: number = 405;
  message: string = "Method Not Allowed";
}
