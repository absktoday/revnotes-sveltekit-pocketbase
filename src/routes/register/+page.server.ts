import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { regOptions, webauthn } from '$lib/server/webauthn';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import kv from '$lib/kv';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (user) redirect(307, '/secure/dashboard');
};

export const actions = {
	default: async ({ request, locals: { pb } }) => {
		const data = await request.formData();
		const username = data.get('username') as string;

		if (!username) return fail(400, { error: true, message: 'username cannot be empty' });

		const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
			rpName: webauthn.rpName,
			rpID: webauthn.rpID,
			userName: username
		});

		// TODO: Save Reg options
		console.log('save optiosn to db');

		const recordData = {
			username,
			options
		};

		kv.set(username, options, { PX: 60000 });

		const record = await pb.collection('webauthn_options').create(recordData);

		return options;
	}
} satisfies Actions;
