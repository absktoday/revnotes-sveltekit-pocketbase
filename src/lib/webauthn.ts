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

const PreReg = async (username: string) => {};

export default { webauthn, PreReg };
