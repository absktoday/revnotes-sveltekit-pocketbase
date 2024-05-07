import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(307, '/secure/dashboard');
};

export const actions = {
	default: async ({ request, locals: { pb } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirm_password') as String;

		if (password !== confirmPassword)
			return fail(400, { error: true, message: "Passwords don't match" });

		// example create data
		const data = {
			username: username,
			email: email,
			emailVisibility: true,
			password: password,
			passwordConfirm: confirmPassword,
			name: username
		};

		const record = await pb.collection('users').create(data);

		return redirect(307, '/signin');
	}
} satisfies Actions;
