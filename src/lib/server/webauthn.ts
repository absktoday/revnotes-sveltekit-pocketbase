import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

const webauthn = {
	/**
	 * Human-readable title for your website
	 */
	rpName: 'RevNotes',
	/**
	 * A unique identifier for your website. 'localhost' is okay for
	 * local dev
	 */
	rpID: 'absk.io'
};

const regOptions = async (username: string) => {
	const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
		rpName: webauthn.rpName,
		rpID: webauthn.rpID,
		userName: username
	});

	return { options };
};

export { webauthn, regOptions };
