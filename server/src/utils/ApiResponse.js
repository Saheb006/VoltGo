class ApiResponse {
    constructor(statusCode, data = null, message = "request successful") {
        // Numeric HTTP status code (e.g. 200, 400)
        this.statusCode = statusCode;

        // Convenience boolean flag for frontend checks
        this.success = statusCode < 400;

        // Human‑readable message
        this.message = message;

        // Actual payload
        this.data = data;
    }
}

export { ApiResponse };
