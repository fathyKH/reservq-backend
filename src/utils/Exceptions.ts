// Base error class
export class ApplicationError extends Error {
    public statusCode: number;
  
    constructor(message: string, statusCode = 400) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Custom product errors
  export class ProductNotFoundError extends ApplicationError {
    constructor(message = "Product not found") {
      super(message, 404); // 404: Not Found
    }
  }
  
  export class InsufficientQuantityError extends ApplicationError {
    constructor(message: string) {
      super(message, 400); // 400: Bad Request
    }
  }
  
  export class PaypalApiError extends ApplicationError {
    constructor(message: string) {
      super(message, 500); // 500: Internal Server Error
    }
  }
