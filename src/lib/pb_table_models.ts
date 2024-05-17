import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

export type WebAuthnOptions = {
	username: string;
	options: PublicKeyCredentialCreationOptionsJSON;
};
