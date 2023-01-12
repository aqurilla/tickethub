import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../NatsWrapper';
import { Ticket } from '../../models/Ticket';

it('returns 404 if the provided ticket id does not exist', async () => {
    const id = getValidTicketID();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', getAuthCookie())
        .send({
            title: 'Ticket test',
            price: 20
        })
        .expect(404);
});

it('returns 401 if the user is not authorized', async () => {
    const id = getValidTicketID();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'Ticket test',
            price: 20
        })
        .expect(401);
});

it('returns 401 if the ticket does not belong to the user', async () => {
    const title = 'Ticket 1';
    const price = 100

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', getAuthCookie())
        .send({
            title,
            price
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', getAuthCookie()) // different user
        .send({
            title: 'Updated Ticket',
            price: 200
        })
        .expect(401);

    // check that update has not been made
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});

it('returns 400 if the user provides an invalid req body', async () => {
    const title = 'Ticket 1';
    const price = 100;
    const cookie = getAuthCookie();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 200
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: -200
        })
        .expect(400);
});

it('updates ticket on valid input', async () => {
    const title = 'Ticket 1';
    const price = 100;
    const updatedTitle = 'Ticket 2';
    const updatedPrice = 200
    const cookie = getAuthCookie();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        });

    const ticketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: updatedTitle,
            price: updatedPrice
        })
        .expect(200);

    expect(ticketResponse.body.title).toEqual(updatedTitle);
    expect(ticketResponse.body.price).toEqual(updatedPrice);
});

it('publishes an event', async () => {
    const title = 'Ticket 1';
    const price = 100;
    const updatedTitle = 'Ticket 2';
    const updatedPrice = 200
    const cookie = getAuthCookie();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        });

    jest.clearAllMocks();
    const ticketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: updatedTitle,
            price: updatedPrice
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects request to update a reserved ticket', async () => {
    const title = 'Ticket 1';
    const price = 100;
    const cookie = getAuthCookie();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price
        });

    const ticket = await Ticket.findById(response.body.id);
    ticket?.set({ orderId: getValidTicketID() });
    await ticket?.save();

    const ticketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'updated',
            price: 500
        })
        .expect(400);

})

const getValidTicketID = () => {
    return new mongoose.Types.ObjectId().toHexString();
}