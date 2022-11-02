import { NextFunction, Request, Response } from "express";
import { DatabaseConnectionError } from "../errors/DatabaseConnectionError";
import { RequestValidationError } from "../errors/RequestValidationError";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof RequestValidationError ||
        err instanceof DatabaseConnectionError) {
        return res.status(err.statusCode).send({ errors: err.serializeError() })
    }

    res.status(400).send({
        errors: [
            {
                message: err.message
            }
        ]
    });
}