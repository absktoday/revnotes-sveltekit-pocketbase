import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const actions = {
	signout: async ({ locals }) => {
		locals.pb.authStore.clear();
		redirect(302, '/signin');
	}
} satisfies Actions;
