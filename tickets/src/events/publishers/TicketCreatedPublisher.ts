import { Publisher, Subjects, TicketCreatedEvent } from "@nsth/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}