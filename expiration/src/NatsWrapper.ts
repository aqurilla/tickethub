import { JetStreamClient, connect, StorageType, NatsConnection } from "nats";

class NatsWrapper {
    private _client?: JetStreamClient;
    private _natsConn?: NatsConnection;

    get client() {
        if (!this._client) {
            throw new Error('Cannot access client before connecting');
        }
        return this._client;
    }

    get natsConn() {
        if (!this._natsConn) {
            throw new Error('NATS connection not established');
        }
        return this._natsConn;
    }

    async connect(url: string) {
        try {
            this._natsConn = await connect({ servers: url });
            console.log('Connected to NATS server');

            // create the stream
            const jetStreamManager = await this._natsConn.jetstreamManager();
            await jetStreamManager.streams.add({
                name: 'ticket',
                subjects: ['ticket.*'],
                storage: StorageType.Memory
            });

            await jetStreamManager.streams.add({
                name: 'order',
                subjects: ['order.*'],
                storage: StorageType.Memory
            });

            await jetStreamManager.streams.add({
                name: 'expiration',
                subjects: ['expiration.*'],
                storage: StorageType.Memory
            });

            this._client = this._natsConn.jetstream();
        } catch (error) {
            console.error(`Error connecting: ${error}`);
            throw error
        }
    }
}

export const natsWrapper = new NatsWrapper();