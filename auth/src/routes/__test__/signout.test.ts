import request from "supertest";
import { app } from "../../app";

it('removes cookie on successful signout', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);

    return expect(response.get('Set-Cookie')).toBeDefined();
});