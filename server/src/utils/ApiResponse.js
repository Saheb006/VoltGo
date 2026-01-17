class ApiResponse {
  constructor(
    statuscode,
    message = "request successful",
    data = null
  ) {
    this.statuscode = statuscode < 400;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };