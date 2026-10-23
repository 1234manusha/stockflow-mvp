
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND"
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  const safeMessages = {
    400: "Invalid request. Please check your input.",
    401: "Authentication required. Please log in again.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This request conflicts with existing data.",
    422: "The submitted data is invalid.",
    429: "Too many requests. Please try again later.",
    500: "An unexpected server error occurred. Please try again.",
    503: "The service is temporarily unavailable. Please try again shortly."
  };

  // Log technical details on the server, never return them to the client.
  console.error("Request error:", {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    code: err.code
  });

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? safeMessages[statusCode] || safeMessages[500]
        : err.message || safeMessages[statusCode] || "Request failed.",
    code: err.code || "REQUEST_ERROR"
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
