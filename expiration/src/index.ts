import { natsWrapper } from "./NatsWrapper";

const startUp = async () => {
    // check env variables
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
    } catch (error) {
        console.error(error)
    }
}

startUp();