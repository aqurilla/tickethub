import { TicketCreatedEvent } from "@nsth/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { TicketCreatedListener } from "../TicketCreatedListener";

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket?.title).toEqual(data.title);
    expect(ticket?.price).toEqual(data.price);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

const setup = async () => {
    const listener = new TicketCreatedListener(natsWrapper.client);
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'title',
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    // @ts-ignore
    const msg: JsMsg = {
        ack: jest.fn()
    }

    return { listener, data, msg };
};