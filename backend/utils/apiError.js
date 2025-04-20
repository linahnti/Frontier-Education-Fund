const { StatusCodes } = require("http-status-codes");

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundError extends ApiError {
  constructor(path) {
    super(StatusCodes.NOT_FOUND, `The requested path ${path} was not found`);
  }
}

class BadRequestError extends ApiError {
  constructor(message) {
    super(StatusCodes.BAD_REQUEST, message);
  }
}

module.exports = { ApiError, NotFoundError, BadRequestError };
