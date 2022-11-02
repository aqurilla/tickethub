import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super();
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serializeError() {
        const formattedErrors = this.errors.map(error => ({
            message: error.msg,
            field: error.param
        }));
        return formattedErrors;
    }
}