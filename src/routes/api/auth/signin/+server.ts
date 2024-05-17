import { webauthn } from '$lib/server/webauthn';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';
import type { Passkey } from '../../../../ambient';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/types';
import { toUint8Array } from 'js-base64';

import {
	deleteWebAuthnOptions,
	getUserPasskey,
	savePassKey,
	signInUserViaAdmin
} from '$lib/server/admin_pb';

export const POST: RequestHandler = async ({ request, url, locals: { pb } }) => {
	const data = await request.json();

	const username: string = data.username;
	const nonce: string = data.nonce;
	const publicKeyCredential: AuthenticationResponseJSON = data.publicKeyCredential;

	try {
		const webAuthnOptionsRecord = await pb
			.collection('webauthn_options')
			.getFirstListItem(`username="${nonce}"`);

		const passkey: Passkey = await getUserPasskey(publicKeyCredential.id);

		const options: PublicKeyCredentialRequestOptionsJSON = webAuthnOptionsRecord.options;

		let verification = await verifyAuthenticationResponse({
			response: publicKeyCredential,
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

			console.log('user Auth ', userAuth);

			pb.authStore.save(userAuth?.token!, userAuth?.record);

			// const userRecord = await pb.collection('users').create(data);

			// const newPasskey: Passkey = {
			// 	// `user` here is from Step 2
			// 	user: userRecord.id,
			// 	// Created by `generateRegistrationOptions()` in Step 1
			// 	webauthnUserID: options.user.id,
			// 	// A unique identifier for the credential
			// 	cred_id: credentialID,
			// 	// The public key bytes, used for subsequent authentication signature verification
			// 	publicKey: fromUint8Array(credentialPublicKey),
			// 	// The number of times the authenticator has been used on this site so far
			// 	counter,
			// 	// Whether the passkey is single-device or multi-device
			// 	deviceType: credentialDeviceType,
			// 	// Whether the passkey has been backed up in some way
			// 	backedUp: credentialBackedUp,
			// 	// `body` here is from Step 2
			// 	transports: publicKeyCredential.response.transports
			// };

			// savePassKey(newPasskey); // add passkey to db

			// deleteWebAuthnOptions(webAuthnOptionsRecord.id); // remove the options from webauthn_options table
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
