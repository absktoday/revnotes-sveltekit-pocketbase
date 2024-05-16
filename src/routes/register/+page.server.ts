import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { webauthn } from '$lib/server/webauthn';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { usernameExists } from '$lib/server/admin_pb';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (user) redirect(307, '/secure/dashboard');
};

export const actions = {
	default: async ({ request, locals: { pb } }) => {
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
			userName: username
		});

		const recordData = {
			username,
			options
		};

		const record = await pb.collection('webauthn_options').create(recordData);

		return options;
	}
} satisfies Actions;
