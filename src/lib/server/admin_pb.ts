import { ADMIN_PASSWORD, ADMIN_USERNAME } from '$env/static/private';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import PocketBase, {
	ClientResponseError,
	type RecordAuthResponse,
	type RecordModel
} from 'pocketbase';

// setup admin pb instance
let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);

// Check if Username Already Registered
const usernameExists = async (username: string): Promise<boolean> => {
	try {
		const user = await adminPb.collection('users').getFirstListItem(`username="${username}"`);
		if (user) return true;
	} catch (e) {
		// If unknown error then print the Error
		if (!(e instanceof ClientResponseError)) {
			console.log('Unable to get username exist info: ', e);
		}
	}
	return false;
};

// Sign In User
const signInUserViaAdmin = async (
	username: string
): Promise<RecordAuthResponse<RecordModel> | undefined> => {
	try {
		let auth: RecordAuthResponse<RecordModel> = await adminPb.send('getTokenForUser', {
			method: 'POST',
			body: { username }
		});

		return auth;
	} catch (e) {
		console.log('Error ', e);
	}
};

export { usernameExists, signInUserViaAdmin };
