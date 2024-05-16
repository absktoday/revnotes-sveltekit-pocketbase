<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<div class="container h-screen mx-auto flex justify-center items-center">
	<div class="card mx-4" style="width: 25rem;">
		<header class="card-header">
			<h1 class="h2">Register</h1>
		</header>

		<form method="POST" class="p-4 space-y-5" use:enhance>
			{#if form?.error}
				<aside class="alert variant-ghost-error">
					<div class="alert-message">
						<p>{form?.message}</p>
					</div>
				</aside>
			{/if}
			<label class="label">
				<span>Username</span>
				<input class="input" name="username" type="text" placeholder="john.doe" required />
			</label>
			<label class="label">
				<span>Email</span>
				<input
					class="input"
					name="email"
					type="email"
					placeholder="john.doe@example.com"
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
