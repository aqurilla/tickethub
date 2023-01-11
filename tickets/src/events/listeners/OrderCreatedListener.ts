import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { Ticket } from "../../models/Ticket";
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

        msg.ack();
    }
}