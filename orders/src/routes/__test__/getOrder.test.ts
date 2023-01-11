import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';

it('returns unauthorized error response if made by non-owner user', async () => {
    const ticket = await buildTicket();
    const user1 = getAuthCookie();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', getAuthCookie())
        .send()
        .expect(401);
});

it('fetches an order for a particular user', async () => {
    const ticket = await buildTicket();
    const user1 = getAuthCookie();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket.id })
        .expect(201);

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user1)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
    expect(fetchedOrder.ticket.id).toEqual(ticket.id);
});

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'test-1',
        price: 50
    })
    await ticket.save()
    return ticket;
}