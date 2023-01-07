import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import { natsWrapper } from '../../NatsWrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})

    expect(response.status).not.toEqual(404);
});

it('can only be accessed by signed in user', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('returns a non 401 status if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
        .set('Cookie', getAuthCookie());

    expect(response.status).not.toEqual(401);
});

it('returns error if invalid title or price is provided', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
        .set('Cookie', getAuthCookie());

    expect(response.status).toEqual(400);
});

it('creates a ticket if valid inputs are provided', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'Test';
    const price = 20;
    const response = await request(app)
        .post('/api/tickets')
        .send({
            title,
            price
        })
        .set('Cookie', getAuthCookie())
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
});

it('publishes an event', async () => {
    const title = 'Test';
    const price = 20;
    await request(app)
        .post('/api/tickets')
        .send({
            title,
            price
        })
        .set('Cookie', getAuthCookie())
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});