import { Listener, OrderCreatedEvent, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { expirationQueue } from "../../queues/ExpirationQueue";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = `${queueGroupName}-oc`;

    async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        await expirationQueue.add(
            {
                orderId: data.id
            },
            {
                delay
            }
        );

        msg.ack();
    }
}