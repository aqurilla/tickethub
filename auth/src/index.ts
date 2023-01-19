import mongoose from "mongoose";
import { app } from "./app";

mongoose.set('strictQuery', true);

const startUp = async () => {
    // check env variables
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined.');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined.');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to mongoDB')
    } catch (error) {
        console.error(error)
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
}

startUp();