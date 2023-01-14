import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queueGroupName";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = `${queueGroupName}-pc`;

    async onMessage(data: PaymentCreatedEvent['data'], msg: JsMsg) {
        const order = await Order.findById(data.orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }
}