import { ExpirationCompleteEvent, Publisher, Subjects } from "@nsth/common";


export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}