export function generateNonce(length = 16) {
	const array = new Uint8Array(length);
	window.crypto.getRandomValues(array);
	return Array.from(array, (byte) => ('0' + byte.toString(16)).slice(-2)).join('');
}
