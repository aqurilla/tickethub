import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', getAuthCookie())
        .send({
            title: `Ticket Demo`,
            price: 50
        });
}

it('fetches a list of tickets', async () => {
    for (let i = 0; i < 3; i++) {
        await createTicket();
    }

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
})