import { Publisher, Subjects, TicketUpdatedEvent } from "@nsth/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}