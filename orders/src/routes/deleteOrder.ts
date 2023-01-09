import { NotFoundError, OrderStatus, requireAuth, UnauthorizedError } from '@nsth/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/Order';

const router = express.Router();

router.delete('/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser?.id) {
            throw new UnauthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        // publish a order.cancelled event

        res.status(204).send(order);
    }
)

export { router as deleteOrderRouter }