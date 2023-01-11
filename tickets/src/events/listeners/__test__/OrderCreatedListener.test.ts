import { OrderCreatedEvent, OrderStatus } from "@nsth/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCreatedListener } from "../OrderCreatedListener";

it('sets the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket?.orderId).toEqual(data.id);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    // save a ticket
    const ticket = Ticket.build({
        title: 'demo',
        price: 200,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString()
    }

    // @ts-ignore
    const msg: JsMsg = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg };
};