import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { webauthn } from '$lib/server/webauthn';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import PocketBase from 'pocketbase';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(304, '/secure/dashboard');
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;

		const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
			rpID: webauthn.rpID
		});

		const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

		await pb.collection('webauthn_options').create({ challenge: options.challenge, options });

		return options;
	}
} satisfies Actions;
