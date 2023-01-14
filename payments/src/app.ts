import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@nsth/common";
import { createChargeRouter } from "./routes/createCharge";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        // to enable cookie access during testing
        secure: process.env.NODE_ENV != 'test'
    })
);

app.use(currentUser);
app.use(createChargeRouter);

app.all('*', () => {
    throw new NotFoundError();
})

// error-handling
app.use(errorHandler);

export { app }