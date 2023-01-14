import { Subjects, Publisher, PaymentCreatedEvent } from '@nsth/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}