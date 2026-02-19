// Login request DTO
export class LoginDto {
  constructor(userName, password) {
    this.userName = userName;
    this.password = password;
  }
}

// Login response DTO
export class LoginResponseDto {
  constructor(token, role, userName, success) {
    this.token = token;
    this.role = role;
    this.userName = userName;
    this.success = success;
  }
}

// API response DTO
export class ApiResponseDto {
  constructor(success, message, data, errors) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}