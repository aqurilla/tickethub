import { Publisher, Subjects, OrderCreatedEvent } from "@nsth/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}