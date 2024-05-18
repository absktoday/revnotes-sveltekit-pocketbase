import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { webauthn } from '$lib/server/webauthn';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { usernameExists } from '$lib/server/admin_pb';
import type { WebAuthnOptions } from '$lib/pb_table_models';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (user) redirect(307, '/secure/dashboard');
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const username = data.get('username') as string;

		if (!username) return fail(400, { error: true, message: 'username cannot be empty' });

		if (await usernameExists(username))
			return fail(400, {
				error: true,
				message: 'Username already registered. Please try a different username.'
			});

		const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
			rpName: webauthn.rpName,
			rpID: webauthn.rpID,
			userName: username,
			userDisplayName: username,
			authenticatorSelection: {
				residentKey: 'required'
			}
		});

		const recordData: WebAuthnOptions = {
			challenge: options.challenge,
			options
		};

		try {
			const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
			await pb.collection('webauthn_options').create({ challenge: options.challenge, options });
		} catch (e) {
			console.error(e);
			fail(400, {
				error: true,
				message: 'Unable to save passkey options please contact your admin.'
			});
		}

		return options;
	}
} satisfies Actions;
