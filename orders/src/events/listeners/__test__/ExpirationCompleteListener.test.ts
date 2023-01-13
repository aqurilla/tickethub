import { ExpirationCompleteEvent, OrderStatus } from "@nsth/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Order } from "../../../models/Order";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { ExpirationCompleteListener } from "../ExpirationCompleteListener";

it('updates order status to cancelled', async () => {
    const { listener, ticket, order, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
})

it('emits an order cancelled event', async () => {
    const { listener, ticket, order, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('acks the message', async () => {
    const { listener, ticket, order, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);
    const ticket = Ticket.build({
        title: 'Demo',
        price: 100,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        ticket
    })
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: JsMsg = {
        ack: jest.fn()
    }

    return { listener, ticket, order, data, msg };
};