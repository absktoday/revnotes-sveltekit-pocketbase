import { randomBytes } from 'crypto';

const characters =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

function generatePassword(length: number): string {
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
