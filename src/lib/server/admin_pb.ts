import { ADMIN_PASSWORD, ADMIN_USERNAME } from '$env/static/private';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import PocketBase, { type RecordAuthResponse, type RecordModel } from 'pocketbase';

const signInUserViaAdmin = async (
	username: string
): Promise<RecordAuthResponse<RecordModel> | undefined> => {
	let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);

	//  // setup admin pb instance
	await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);

	try {
		let auth = (await adminPb.send('getTokenForUser', {
			method: 'POST',
			body: { username }
		})) as RecordAuthResponse<RecordModel>;

		return auth;
	} catch (e) {
		console.log('Error ', e);
	}
};

export default signInUserViaAdmin;
