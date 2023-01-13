import { Listener, OrderCreatedEvent, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queueGroupName";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = `${queueGroupName}-ocr`;

    async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
        const order = Order.build({
            id: data.id,
            version: data.version,
            userId: data.userId,
            status: data.status,
            price: data.ticket.price
        })
        await order.save();

        msg.ack();
    }
}