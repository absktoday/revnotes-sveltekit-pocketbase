import { randomBytes } from 'crypto';

function generatePassword(length: number): string {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
	let password = '';
	const characterCount = characters.length;
	for (let i = 0; i < length; i++) {
		const randomValue = randomBytes(1)[0];
		const index = randomValue % characterCount;
		password += characters.charAt(index);
	}
	return password;
}

export default generatePassword;
