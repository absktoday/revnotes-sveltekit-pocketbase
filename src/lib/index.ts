const characters =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

function generatePassword(length: number): string {
	const characterCount = characters.length;
	let password = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characterCount);
		password += characters.charAt(randomIndex);
	}

	return password;
}

function generateSecurePassword(length: number): string {
	const characterCount = characters.length;
	let password = '';

	const randomValues = new Uint32Array(length);
	globalThis.crypto.getRandomValues(randomValues);

	for (let i = 0; i < length; i++) {
		const randomIndex = randomValues[i] % characterCount;
		password += characters.charAt(randomIndex);
	}

	return password;
}

export { generatePassword, generateSecurePassword };
