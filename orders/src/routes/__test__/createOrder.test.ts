import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/Ticket';
import { Order, OrderStatus } from '../../models/Order';

it('returns an error if ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', getAuthCookie())
        .send({
            ticketId
        })
        .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        title: 'Test',
        price: 100
    });
    await ticket.save();

    const order = Order.build({
        ticket,
        status: OrderStatus.Created,
        userId: 'abcd1234',
        expiresAt: new Date()
    });
    await order.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie', getAuthCookie())
        .send({
            ticketId: ticket.id
        })
        .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        title: 'Test',
        price: 100
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', getAuthCookie())
        .send({
            ticketId: ticket.id
        })
        .expect(201);
});

it.todo('emits an order created event')