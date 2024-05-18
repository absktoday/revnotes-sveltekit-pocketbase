// src/hooks.server.ts
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '$env/static/private';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
	// Init User PB instance
	event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);

	// load the store data from the request cookie string
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
		let authState =
			event.locals.pb.authStore.isValid &&
			(await event.locals.pb.collection('users').authRefresh());

		if (authState === false) {
			throw new Error();
		}

		event.locals.user = authState.record;
	} catch (_) {
		// clear the auth store on failed refresh
		event.locals.pb.authStore.clear();
		if (event.url.pathname.startsWith('/secure')) redirect(307, '/signin');
	}

	// if (event.url.pathname.startsWith('/signin')) redirect(307, '/secure');

	const response = await resolve(event);

	// send back the default 'pb_auth' cookie to the client with the latest store state
	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie());

	return response;
};
