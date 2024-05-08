import WebAuthnConfig from '$lib/server/config/rp_config';
import { error, json } from '@sveltejs/kit';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RequestHandler } from './$types';
import type {
	PublicKeyCredentialCreationOptionsJSON,
	RegistrationResponseJSON
} from '@simplewebauthn/types';
import type { Passkey } from '../../../../ambient';
import generatePassword from '$lib/server/genpass';

export const POST: RequestHandler = async ({ request, url, locals: { pb } }) => {
	const { username, attResp } = await request.json();

	const record = await pb.collection('webauthn_options').getFirstListItem(`username="${username}"`);
	console.log('record', record);

	const currentOptions: PublicKeyCredentialCreationOptionsJSON = record.options;

	console.log('CurrentOptions: ', currentOptions);
	console.log('origin: ', url.origin);
	const regRespJSON = attResp as RegistrationResponseJSON;
	let verification;
	try {
		verification = await verifyRegistrationResponse({
			response: regRespJSON,
			expectedChallenge: currentOptions.challenge,
			expectedOrigin: WebAuthnConfig.origin,
			expectedRPID: WebAuthnConfig.rpID
		});

		const { verified, registrationInfo } = verification;

		if (verified && registrationInfo) {
			const password = generatePassword(32);
			// example create data
			const data = {
				username,
				password,
				passwordConfirm: password
			};

			const userRecord = await pb.collection('users').create(data);

			const newPasskey: Passkey = {
				cred_id: registrationInfo.credentialID,
				public_key: Buffer.from(registrationInfo.credentialPublicKey),
				user: userRecord.id,
				webauthn_user_id: currentOptions.user.id,
				counter: registrationInfo.counter,
				device_type: registrationInfo.credentialDeviceType,
				backup: registrationInfo.credentialBackedUp,
				transports: regRespJSON.response.transports
			};

			console.log('Passkey Data: ', newPasskey);

			const passkeyRecord = await pb.collection('passkeys').create(newPasskey);

			return json({ verified });
		} else {
			throw new Error();
		}
	} catch (err) {
		const _error = err as Error;
		console.error(_error);
		error(400, _error.message);
	}
};
