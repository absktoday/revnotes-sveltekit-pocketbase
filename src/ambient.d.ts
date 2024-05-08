import type {
	AuthenticatorTransportFuture,
	CredentialDeviceType,
	Base64URLString
} from '@simplewebauthn/types';

type UserModel = {
	id: any;
	username: string;
};

/**
 * It is strongly advised that credentials get their own DB
 * table, ideally with a foreign key somewhere connecting it
 * to a specific UserModel.
 *
 * "SQL" tags below are suggestions for column data types and
 * how best to store data received during registration for use
 * in subsequent authentications.
 */
type Passkey = {
	// SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
	//      Caution: Node ORM's may map this to a Buffer on retrieval,
	//      convert to Uint8Array as necessary
	public_key: Uint8Array;
	// SQL: Foreign Key to an instance of your internal user model
	user: string;
	// SQL: Store as `TEXT`. Index this column. A UNIQUE constraint on
	//      (webAuthnUserID + user) also achieves maximum user privacy
	webauthn_user_id: Base64URLString;
	// SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
	counter: number;
	// SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
	// Ex: 'singleDevice' | 'multiDevice'
	device_type: CredentialDeviceType;
	// SQL: `BOOL` or whatever similar type is supported
	backup: boolean;
	// SQL: `VARCHAR(255)` and store string array as a CSV string
	// Ex: ['ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb']
	transports?: AuthenticatorTransportFuture[];

	cred_id: string;
};
