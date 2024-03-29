import { NotFoundError, OrderStatus, requireAuth, UnauthorizedError } from '@nsth/common';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publishers/OrderCancelledPublisher';
import { Order } from '../models/Order';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

router.delete('/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser?.id) {
            throw new UnauthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        // publish an order.cancelled event
        await new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        res.status(204).send(order);
    }
)

export { router as deleteOrderRouter }