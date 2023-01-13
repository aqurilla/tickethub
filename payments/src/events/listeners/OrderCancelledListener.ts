import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@nsth/common";
import { JsMsg } from "nats";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queueGroupName";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = `${queueGroupName}-oca`;

    async onMessage(data: OrderCancelledEvent['data'], msg: JsMsg) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });
        if (!order) {
            throw new Error('Order not found');
        }
        order.set({ status: OrderStatus.Cancelled });
        await order.save();
        msg.ack();
    }
}