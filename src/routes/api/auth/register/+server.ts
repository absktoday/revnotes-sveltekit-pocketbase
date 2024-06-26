import { webauthn } from '$lib/server/webauthn';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';
import type {
	PublicKeyCredentialCreationOptionsJSON,
	RegistrationResponseJSON
} from '@simplewebauthn/types';
import { fromUint8Array } from 'js-base64';
import { decode } from 'js-base64';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '$env/static/private';
import { generatePassword, generateSecurePassword } from '$lib';

export const POST: RequestHandler = async ({ request, url, locals: { pb } }) => {
	const data = await request.json();

	// Init Admin PB instance
	let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
	let adminAuth = adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);

	const username = data.username;
	const publicKeyCredential: RegistrationResponseJSON = data.publicKeyCredential;

	try {
		let challenge = JSON.parse(decode(publicKeyCredential.response.clientDataJSON)).challenge;

		const webAuthnOptionsRecord = await pb
			.collection('webauthn_options')
			.getFirstListItem(`challenge="${challenge}"`);

		const options: PublicKeyCredentialCreationOptionsJSON = webAuthnOptionsRecord.options;

		let verification = await verifyRegistrationResponse({
			response: publicKeyCredential,
			expectedChallenge: options.challenge,
			expectedOrigin: url.origin,
			expectedRPID: webauthn.rpID
		});

		let { verified, registrationInfo } = verification;

		const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } =
			registrationInfo!;

		if (verified) {
			let password = generateSecurePassword(24);

			const data = {
				username,
				password,
				passwordConfirm: password
			};

			const userRecord = await pb.collection('users').create(data);

			const newPasskeyData = {
				// `user` here is from Step 2
				user: userRecord.id,
				// Created by `generateRegistrationOptions()` in Step 1
				webauthnUserID: options.user.id,
				// A unique identifier for the credential
				cred_id: credentialID,
				// The public key bytes, used for subsequent authentication signature verification
				publicKey: fromUint8Array(credentialPublicKey),
				// The number of times the authenticator has been used on this site so far
				counter,
				// Whether the passkey is single-device or multi-device
				deviceType: credentialDeviceType,
				// Whether the passkey has been backed up in some way
				backedUp: credentialBackedUp,
				// `body` here is from Step 2
				transports: publicKeyCredential.response.transports
			};

			await adminAuth;

			await adminPb.collection('passkeys').create(newPasskeyData); // add passkey to db

			await adminPb.collection('webauthn_options').delete(webAuthnOptionsRecord.id); // remove the options from webauthn_options table
		}
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

	return json({ success: true });
};
