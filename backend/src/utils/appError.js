class appError extends Error {
  constructor(message, statusCode = 400, statusText = "FAIL") {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

module.exports = appError;
