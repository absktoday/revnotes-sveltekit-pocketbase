import { webauthn } from '$lib/server/webauthn';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ClientResponseError, type RecordAuthResponse, type RecordModel } from 'pocketbase';
import type { Passkey } from '../../../../ambient';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/types';
import { toUint8Array, decode } from 'js-base64';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '$env/static/private';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import PocketBase from 'pocketbase';

export const POST: RequestHandler = async ({ request, url, locals: { pb } }) => {
	const data = await request.json();
	// Init Admin PB instance
	let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);

	const username: string = data.username;
	const nonce: string = data.nonce;
	const authResp: AuthenticationResponseJSON = data.publicKeyCredential;

	try {
		let challenge = JSON.parse(decode(authResp.response.clientDataJSON)).challenge;

		const webAuthnOptionsRecord = await pb
			.collection('webauthn_options')
			.getFirstListItem(`challenge="${challenge}"`);

		await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);

		const passkey: Passkey = await adminPb
			.collection('passkeys')
			.getFirstListItem(`cred_id="${authResp.id}"`);

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

		let { verified, authenticationInfo } = verification;

		const { newCounter } = authenticationInfo!;

		if (verified) {
			const record = await adminPb.collection('users').getOne(passkey.user);

			let userAuth: RecordAuthResponse<RecordModel> = await adminPb.send('getTokenForUser', {
				method: 'POST',
				body: { username: record.username }
			});

			pb.authStore.save(userAuth?.token!, userAuth?.record);
		}

		return json({ verified });
	} catch (e) {
		console.error(e);
		if (e instanceof ClientResponseError) {
			console.log('Pocketbase error ', e);
			error(400, `Request invalid. Please try again. Message: ${e.message}`);
		}
		if (e instanceof Error) {
			error(400, e.message);
		}
	}
	error(400, 'Could Not Complete Sign In Request. Please Contact Admin.');
};
