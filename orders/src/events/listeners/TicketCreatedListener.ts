import { Listener, Subjects, TicketCreatedEvent } from "@nsth/common";
import { JsMsg } from "nats";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    readonly queueGroupName = `${queueGroupName}-tc`;

    async onMessage(data: TicketCreatedEvent['data'], msg: JsMsg) {
        const { id, title, price } = data;
        const ticket = Ticket.build({
            id,
            title,
            price
        });

        await ticket.save();

        msg.ack();
    }
}