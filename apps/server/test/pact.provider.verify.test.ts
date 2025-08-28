import { Verifier } from '@pact-foundation/pact';

describe('Pact provider verification', () => {
    it('verifies consumer contracts', async () => {
        const opts = {
            providerBaseUrl: process.env.PROVIDER_BASE_URL || 'http://localhost:3001',
            pactUrls: [require('path').resolve(__dirname, '../../testing/contracts/pacts/blog-app-server-api.json')],
            publishVerificationResult: false,
            providerVersion: 'dev',
        } as any;

        const output = await new Verifier(opts).verifyProvider();
        expect(output).toBeTruthy();
    });
});


