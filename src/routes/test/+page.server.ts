import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, locals: { pb }, cookies }) => {
		const recosrd = await pb.collection('users').getFirstListItem('email="pb@absk.io"');

		console.log('re ', recosrd);

		// if (recosrd) return fail(400, { error: true, message: 'Username already registered' });
	}
} satisfies Actions;
