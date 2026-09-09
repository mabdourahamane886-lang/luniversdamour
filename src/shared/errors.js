export class AppError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function errorBody(code, message) {
  return { error: { code, message } };
}

export function successBody(data) {
  return { success: true, data };
}
