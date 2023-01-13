
import { OrderCancelledEvent, OrderStatus } from "@nsth/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Order } from "../../../models/Order";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCancelledListener } from "../OrderCancelledListener";

it('changes order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: 'abc',
        status: OrderStatus.Created,
        price: 10
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: ""
        }
    }

    // @ts-ignore
    const msg: JsMsg = {
        ack: jest.fn()
    }

    return { listener, order, data, msg };
};