import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import path from 'path';

const pact = new PactV3({
    dir: path.resolve(process.cwd(), '../../..', 'testing', 'contracts', 'pacts'),
    consumer: 'blog-app',
    provider: 'server-api',
});

describe('Auth API contract (consumer: blog)', () => {
    it('login should accept usernameOrEmail and password', async () => {
        const interaction = pact
            .given('A user exists with usernameOrEmail and password')
            .uponReceiving('a login request')
            .withRequest({
                method: 'POST',
                path: '/auth/login',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    usernameOrEmail: MatchersV3.like('test@example.com'),
                    password: MatchersV3.like('test123'),
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: {
                    accessToken: MatchersV3.like('ey...'),
                    user: {
                        id: MatchersV3.like('uuid'),
                        email: MatchersV3.like('test@example.com'),
                        username: MatchersV3.like('test'),
                        roles: MatchersV3.like(['user']),
                    },
                },
            });

        await pact.addInteraction(interaction);

        await pact.executeTest(async (mockServer) => {
            const res = await fetch(`${mockServer.url}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: 'test@example.com', password: 'test123' }),
            });
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.accessToken).toBeTruthy();
        });
    });
});


