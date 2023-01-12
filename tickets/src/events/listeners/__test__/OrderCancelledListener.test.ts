import { OrderCancelledEvent, OrderStatus } from "@nsth/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCancelledListener } from "../OrderCancelledListener";

it('updates the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket?.orderId).toBeUndefined();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString();

    // save a ticket
    const ticket = Ticket.build({
        title: 'demo',
        price: 200,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }

    // @ts-ignore
    const msg: JsMsg = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg, orderId };
};