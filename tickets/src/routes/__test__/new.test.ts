import request from 'supertest';
import { app } from '../../app';

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
    const response = await request(app)
        .post('/api/tickets')
        .send({
            title: 'Test',
            price: 100
        })
        .set('Cookie', getAuthCookie());

    // add check for DB

    expect(response.status).toEqual(201);
});