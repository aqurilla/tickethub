import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@nsth/common";

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

app.all('*', () => {
    throw new NotFoundError();
})

// error-handling
app.use(errorHandler);

export { app }