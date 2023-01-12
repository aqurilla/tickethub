import { Listener, OrderCreatedEvent, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { Ticket } from "../../models/Ticket";
import { TicketUpdatedPublisher } from "../publishers/TicketUpdatedPublisher";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = `${queueGroupName}-ocr`;

    async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
        // find the ticket connected to the order
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // update its orderId
        ticket.set({
            orderId: data.id
        })
        await ticket.save();

        // publish event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        });

        msg.ack();
    }
}