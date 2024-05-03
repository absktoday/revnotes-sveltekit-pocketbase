import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { pb, user } }) => {
	// load notes for user
	const resultList = await pb.collection('notes').getFullList({
		sort: '-created'
	});
	return {
		user,
		resultList
	};
};

export const actions = {
	addnote: async ({ locals: { pb, user }, request }) => {
		console.log('Add Note');

		const formData = await request.formData();
		const title = formData.get('title') as string | undefined;
		const content = formData.get('content') as string;

		const data = {
			user: user?.id,
			title: title,
			content: content
		};

		const record = await pb.collection('notes').create(data);
	},

	deletenote: async ({ locals: { pb, user }, request }) => {
		console.log('Delete Note');

		const formData = await request.formData();
		const id = formData.get('id') as string;

		await pb.collection('notes').delete(id);
	}
} satisfies Actions;
