import mongoose from "mongoose";
import { app } from "./app";
import { TicketCreatedListener } from "./events/listeners/TicketCreatedListener";
import { TicketUpdatedListener } from "./events/listeners/TicketUpdatedListener";
import { natsWrapper } from "./NatsWrapper";

const startUp = async () => {
    // check env variables
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }

    try {
        await natsWrapper.connect(process.env.NATS_URL);
        const closeConn = async () => {
            console.log('Closing client');
            natsWrapper.natsConn && await natsWrapper.natsConn.close();
            const err = natsWrapper.natsConn && await natsWrapper.natsConn.closed();
            if (err) {
                console.log(`Error closing: ${err}`);
            }
            process.exit();
        }

        process.on('SIGINT', async () => await closeConn());
        process.on('SIGTERM', async () => await closeConn());

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to mongoDB');
    } catch (error) {
        console.error(error)
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
}

startUp();