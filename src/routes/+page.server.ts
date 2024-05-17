import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { signInUserViaAdmin } from '$lib/server/admin_pb';

export const actions = {
	default: async ({ request, locals: { pb }, cookies }) => {
		let auth = await signInUserViaAdmin('absk');

		if (auth) {
			pb.authStore.save(auth.token, auth.record);

			console.log('Auth ', auth);

			return { success: true };
		}

		return fail(400, {});
	}
} satisfies Actions;
