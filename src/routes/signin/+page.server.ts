import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(307, '/secure/dashboard');
};

export const actions = {
	default: async ({ request, locals: { pb } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (email.length < 1) return fail(400, { message: 'Please enter you email' });
		const { token, record } = await pb.collection('users').authWithPassword(email, password);

		if (token === null || record === null) return fail(400, { message: 'Unable to sign in' });

		return { success: true };
	}
} satisfies Actions;
