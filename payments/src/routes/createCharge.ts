import { BadRequestError, NotFoundError, OrderStatus, requireAuth, UnauthorizedError, validateRequest } from '@nsth/common';
import express, { Request, Response } from 'express';
import { body } from "express-validator";
import { PaymentCreatedPublisher } from '../events/publishers/PaymentCreatedPublisher';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { natsWrapper } from '../NatsWrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty(),
        body('orderId').not().isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser?.id) {
            throw new UnauthorizedError();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Order was cancelled');
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token
        });

        const payment = Payment.build({
            orderId: order.id,
            stripeId: charge.id
        });
        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });

        res.status(201).send(payment);
    }
)

export { router as createChargeRouter };