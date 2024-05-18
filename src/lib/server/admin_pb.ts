import { ADMIN_PASSWORD, ADMIN_USERNAME } from '$env/static/private';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import type { WebAuthnOptions } from '$lib/pb_table_models';
import PocketBase, {
	ClientResponseError,
	type RecordAuthResponse,
	type RecordModel
} from 'pocketbase';
import type { Passkey } from '../../ambient';

// Check if Username Already Registered
const usernameExists = async (username: string): Promise<boolean> => {
	try {
		// Setup admin pb instance
		let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
		await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);

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
	userId: string
): Promise<RecordAuthResponse<RecordModel> | undefined> => {
	try {
		// Setup admin pb instance
		let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
		await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);

		const record = await adminPb.collection('users').getOne(userId);

		let auth: RecordAuthResponse<RecordModel> = await adminPb.send('getTokenForUser', {
			method: 'POST',
			body: { username: record.username }
		});

		return auth;
	} catch (e) {
		console.log('Error ', e);
	}
};

const saveWebAuthnOptions = async (options: WebAuthnOptions) => {
	// Setup admin pb instance
	let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
	await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);

	return await adminPb.collection('webauthn_options').create(options);
};

const deleteWebAuthnOptions = async (webauthnOptionRecordId: string) => {
	// Setup admin pb instance
	let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
	await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);
	await adminPb.collection('webauthn_options').delete(webauthnOptionRecordId);
};

const savePassKey = async (passkey: {}) => {
	// Setup admin pb instance
	let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
	await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);
	await adminPb.collection('passkeys').create(passkey);
};

const getUserPasskey = async (credId: string): Promise<Passkey> => {
	// Setup admin pb instance
	let adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);
	await adminPb.admins.authWithPassword(ADMIN_USERNAME, ADMIN_PASSWORD);
	return await adminPb.collection('passkeys').getFirstListItem(`cred_id="${credId}"`);
};

export {
	usernameExists,
	signInUserViaAdmin,
	saveWebAuthnOptions,
	deleteWebAuthnOptions,
	savePassKey,
	getUserPasskey
};
