import signInUserViaAdmin from '$lib/server/admin_pb';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import generator from 'generate-password';

export const actions = {
	default: async ({ request, locals: { pb }, cookies }) => {
		const password = generator.generate({
			length: 24,
			numbers: true
		});

		const data = {
			username: 'asdasd',
			password,
			passwordConfirm: password
		};

		const userRecord = await pb.collection('users').create(data);
	}
} satisfies Actions;
