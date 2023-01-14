import { OrderStatus } from '@nsth/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/Order';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('returns a 404 for a non-existent order', async () => {
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', getAuthCookie())
        .send({
            token: 'abc',
            orderId: new mongoose.Types.ObjectId().toHexString()
        });

    expect(response.status).toEqual(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 50
    });
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', getAuthCookie())
        .send({
            token: 'abc',
            orderId: order.id
        });

    expect(response.status).toEqual(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId,
        status: OrderStatus.Cancelled,
        price: 50
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', getAuthCookie(userId))
        .send({
            token: 'abc',
            orderId: order.id
        })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId,
        status: OrderStatus.Created,
        price: 50
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', getAuthCookie(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const chargeOpts = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOpts.source).toEqual('tok_visa');
    expect(chargeOpts.amount).toEqual(50 * 100);
    expect(chargeOpts.currency).toEqual('usd');
});