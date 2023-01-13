
import { OrderCreatedEvent, OrderStatus } from "@nsth/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Order } from "../../../models/Order";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCreatedListener } from "../OrderCreatedListener";

it('creates and saves an order', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const order = await Order.findById(data.id);
    expect(order).toBeDefined();
    expect(order?.price).toEqual(data.ticket.price);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: "abc",
        expiresAt: "abc",
        ticket: {
            id: "abc",
            price: 100
        }
    }

    // @ts-ignore
    const msg: JsMsg = {
        ack: jest.fn()
    }

    return { listener, data, msg };
};