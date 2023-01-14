import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { Order } from "../../models/Order";
import { OrderCancelledPublisher } from "../publishers/OrderCancelledPublisher";
import { queueGroupName } from "./queueGroupName";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = `${queueGroupName}-ec`;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: JsMsg) {
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.status === OrderStatus.Complete) {
            // no cancellation required
            return msg.ack();
        }
        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        msg.ack();
    }
}