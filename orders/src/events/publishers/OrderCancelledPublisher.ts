import { Publisher, Subjects, OrderCancelledEvent } from "@nsth/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}