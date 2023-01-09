import { OrderStatus } from '@nsth/common';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/Order';
import { Ticket } from '../../models/Ticket';

it('returns unauthorized error response if request made by non-owner user', async () => {
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

it('deletes an order', async () => {
    const ticket = await buildTicket();
    const user1 = getAuthCookie();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user1)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it.todo('emits an order cancelled event');

const buildTicket = async () => {
    const ticket = Ticket.build({
        title: 'test-1',
        price: 50
    })
    await ticket.save()
    return ticket;
}