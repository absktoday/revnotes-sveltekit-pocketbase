// config.ts

import { PUBLIC_ORIGIN } from '$env/static/public';

// Human-readable title for your website
const rpName = 'ABSK';

// A unique identifier for your website. 'localhost' is okay for local development
const rpID = 'absk.io';

// The URL at which registrations and authentications should occur.
// 'http://localhost' and 'http://localhost:PORT' are also valid.
// Do NOT include any trailing '/'
const origin = `https://${PUBLIC_ORIGIN}`;

const WebAuthnConfig = {
	rpName,
	rpID,
	origin
};

export default WebAuthnConfig;
