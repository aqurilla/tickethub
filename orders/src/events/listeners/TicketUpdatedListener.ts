import { Listener, Subjects, TicketUpdatedEvent } from "@nsth/common";
import { JsMsg } from "nats";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    readonly queueGroupName = `${queueGroupName}-tu`;

    async onMessage(data: TicketUpdatedEvent['data'], msg: JsMsg) {
        const { id, title, price } = data;
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error("Ticket not found");
        }
        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}