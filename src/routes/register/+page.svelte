<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';
	export let form: ActionData;
	import { startRegistration } from '@simplewebauthn/browser';

	// Form Data
	let username: string;

	const submitForm: SubmitFunction = () => {
		return async ({ result, update }) => {
			switch (result.type) {
				case 'error':
					console.log('error');
					break;
				case 'success':
					console.log('result ');
					let publicKeyCredential = await startRegistration(result.data!);

					console.log('public key creds ', publicKeyCredential);

					console.log('username ', username);

					const validationResponse = await fetch('/api/auth/register', {
						method: 'POST',
						body: JSON.stringify({
							username,
							publicKeyCredential
						}),
						headers: {
							'Content-Type': 'application/json'
						}
					});
					console.log('validationResponse ', await validationResponse.json());
					break;
			}
			await update();
		};
	};
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<div class="container h-screen mx-auto flex justify-center items-center">
	<div class="card mx-4" style="width: 25rem;">
		<header class="card-header">
			<h1 class="h2">Register</h1>
		</header>

		<form method="POST" class="p-4 space-y-5" use:enhance={submitForm}>
			{#if form?.error}
				<aside class="alert variant-ghost-error">
					<div class="alert-message">
						<p>{form?.message}</p>
					</div>
				</aside>
			{/if}
			<label class="label">
				<span>Username</span>
				<input
					class="input"
					name="username"
					bind:value={username}
					type="text"
					placeholder="john.doe"
					required
				/>
			</label>
			<button type="submit" class="btn variant-filled w-full">Register</button>
		</form>

		<footer class="card-footer">
			Already have an account? <a href="signin" class=" text-primary-500">Sign In</a>
			<p class="mt-4 text-xs text-center">
				By creating an account and/or logging in, you agree to RevNotes <span
					class=" text-primary-500">Terms of Service</span
				>
				and
				<span class=" text-primary-500">Privacy Policy</span>.
			</p>
		</footer>
	</div>
</div>
