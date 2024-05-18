import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { webauthn } from '$lib/server/webauthn';
import { saveWebAuthnOptions } from '$lib/server/admin_pb';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(307, '/secure/dashboard');
};

export const actions = {
	default: async ({ request, locals: { pb } }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;

		console.log('username ', username);

		const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
			rpID: webauthn.rpID
		});

		console.log('Options ', options);

		await saveWebAuthnOptions({ challenge: options.challenge, options });

		return options;
	}
} satisfies Actions;
