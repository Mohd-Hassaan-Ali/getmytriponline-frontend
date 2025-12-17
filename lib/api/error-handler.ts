export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export function handleAPIError(error: any): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || 'An error occurred';
    const code = data?.code;
    return new APIError(message, status, code);
  }

  if (error.request) {
    return new APIError('Network error - please check your connection', 0);
  }

  return new APIError(error.message || 'Unknown error occurred', 500);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}