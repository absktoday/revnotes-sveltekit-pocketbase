import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import WebAuthnConfig from '$lib/server/config/rp_config';
import {
	// Authentication
	generateAuthenticationOptions,
	// Registration
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from '@simplewebauthn/server';
import type {
	GenerateAuthenticationOptionsOpts,
	GenerateRegistrationOptionsOpts,
	VerifiedAuthenticationResponse,
	VerifiedRegistrationResponse,
	VerifyAuthenticationResponseOpts,
	VerifyRegistrationResponseOpts
} from '@simplewebauthn/server';
import generatePassword from '$lib/server/genpass';
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(307, '/secure/dashboard');
};

export const actions = {
	default: async ({ request, locals: { pb } }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;

		const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
			rpName: WebAuthnConfig.rpName,
			rpID: WebAuthnConfig.rpID,
			userName: username,
			// See "Guiding use of authenticators via authenticatorSelection" below
			authenticatorSelection: {
				// Defaults
				residentKey: 'preferred',
				userVerification: 'preferred'
			}
		});

		// example create data
		const data = {
			username: username,
			options: options
		};

		const record = await pb.collection('webauthn_options').create(data);

		return { options };
	}
} satisfies Actions;
