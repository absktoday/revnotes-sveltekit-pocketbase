import kv from '$lib/kv';
import { webauthn } from '$lib/server/webauthn';
import {
	verifyRegistrationResponse,
	type VerifiedRegistrationResponse
} from '@simplewebauthn/server';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { pb } }) => {
	const data = await request.json();

	const username = data.username;
	const publicKeyCredential = data.publicKeyCredential;

	const options = kv.get(username);

	if (!options) return error(400, "Options can't be empty");

	console.log('Options from kv ', options);

	// const record = await pb.collection('webauthn_options').getFirstListItem(`username="${username}"`);

	// console.log('Options for ', record);

	let verification: VerifiedRegistrationResponse;
	try {
		verification = await verifyRegistrationResponse({
			response: publicKeyCredential,
			expectedChallenge: options.challenge,
			expectedOrigin: url.origin,
			expectedRPID: webauthn.rpID
		});

		console.log(verification);
	} catch (error) {
		console.error(error);
	}

	return json({ success: true });
};
