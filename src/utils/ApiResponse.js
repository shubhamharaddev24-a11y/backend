class ApiResponse {
  constructor(success, data, message, statusCode = 200) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Operation successful') {
    return new ApiResponse(true, data, message, 200);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(true, data, message, 201);
  }

  static error(message, statusCode = 400) {
    return new ApiResponse(false, null, message, statusCode);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(false, null, message, 404);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiResponse(false, null, message, 401);
  }

  static forbidden(message = 'Forbidden access') {
    return new ApiResponse(false, null, message, 403);
  }

  static serverError(message = 'Internal server error') {
    return new ApiResponse(false, null, message, 500);
  }

  toJSON() {
    const response = {
      success: this.success,
      message: this.message,
      timestamp: this.timestamp
    };

    if (this.data !== null) {
      response.data = this.data;
    }

    return response;
  }
}

module.exports = ApiResponse;
