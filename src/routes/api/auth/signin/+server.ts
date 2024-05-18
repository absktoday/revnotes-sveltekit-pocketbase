import { webauthn } from '$lib/server/webauthn';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';
import type { Passkey } from '../../../../ambient';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/types';
import { toUint8Array, decode } from 'js-base64';
import { getUserPasskey, signInUserViaAdmin } from '$lib/server/admin_pb';

export const POST: RequestHandler = async ({ request, url, locals: { pb } }) => {
	const data = await request.json();

	const username: string = data.username;
	const nonce: string = data.nonce;
	const authResp: AuthenticationResponseJSON = data.publicKeyCredential;

	try {
		let challenge = JSON.parse(decode(authResp.response.clientDataJSON)).challenge;

		const webAuthnOptionsRecord = await pb
			.collection('webauthn_options')
			.getFirstListItem(`challenge="${challenge}"`);

		const passkey: Passkey = await getUserPasskey(authResp.id);

		const options: PublicKeyCredentialRequestOptionsJSON = webAuthnOptionsRecord.options;

		let verification = await verifyAuthenticationResponse({
			response: authResp,
			expectedChallenge: options.challenge,
			expectedOrigin: url.origin,
			expectedRPID: webauthn.rpID,
			authenticator: {
				credentialID: passkey.id,
				credentialPublicKey: toUint8Array(passkey.publicKey),
				counter: passkey.counter,
				transports: passkey.transports
			}
		});

		console.log('veri ', verification);

		let { verified, authenticationInfo } = verification;

		const { newCounter } = authenticationInfo!;

		if (verified) {
			const userAuth = await signInUserViaAdmin(passkey.user);

			pb.authStore.save(userAuth?.token!, userAuth?.record);
		}
	} catch (e) {
		console.error(e);
		if (e instanceof ClientResponseError) {
			console.log('Pocketbase error ', e);
			error(400, 'Request invalid. Please try again');
		}
		if (e instanceof Error) {
			error(400, e.message);
		}
	}

	return json({ success: true });
};
