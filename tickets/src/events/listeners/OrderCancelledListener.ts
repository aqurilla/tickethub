import { Listener, OrderCancelledEvent, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { Ticket } from "../../models/Ticket";
import { TicketUpdatedPublisher } from "../publishers/TicketUpdatedPublisher";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = `${queueGroupName}-oca`;

    async onMessage(data: OrderCancelledEvent['data'], msg: JsMsg) {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('Ticket not found')
        }
        ticket.set({ orderId: undefined });
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