import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

declare global {
    var getAuthCookie: () => string[];
}

jest.mock('orders/src/NatsWrapper.ts');

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'key';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }

    await mongoose.connection.close()
})

global.getAuthCookie = () => {
    // build JWT payload {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // create the session object
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    const session = { jwt: token };
    const base64 = Buffer.from(JSON.stringify(session)).toString('base64');
    return [`session=${base64}`];
}