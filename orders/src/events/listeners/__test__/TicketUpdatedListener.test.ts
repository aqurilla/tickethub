import { TicketUpdatedEvent } from "@nsth/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { TicketUpdatedListener } from "../TicketUpdatedListener";

it('finds, updates and saves a ticket', async () => {
    const { listener, data, ticket, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
    expect(updatedTicket?.version).toEqual(data.version);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'demo',
        price: 50
    })
    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new demo',
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    // @ts-ignore
    const msg: JsMsg = {
        ack: jest.fn()
    }

    return { listener, data, ticket, msg };
};