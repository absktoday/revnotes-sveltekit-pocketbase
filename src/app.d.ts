// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import PocketBase, { type RecordModel } from 'pocketbase';
declare global {
	namespace App {
		interface Locals {
			pb: PocketBase;
			user: RecordModel | null;
		}
		// interface PageData {}
		// interface Error {}
		// interface Platform {}
	}
}
