import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@nsth/common";
import { createOrderRouter } from "./routes/createOrder";
import { getOrderRouter } from "./routes/getOrder";
import { deleteOrderRouter } from "./routes/deleteOrder";
import { indexOrderRouter } from "./routes";


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
app.use(createOrderRouter);
app.use(getOrderRouter);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);

app.all('*', () => {
    throw new NotFoundError();
})

// error-handling
app.use(errorHandler);

export { app };