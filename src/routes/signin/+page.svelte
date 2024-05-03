<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<div class="container h-screen mx-auto flex justify-center items-center">
	<div class="card mx-4" style="width: 25rem;">
		<header class="card-header">
			<h1 class="h2">Sign In</h1>
		</header>
		<form method="POST" class="p-4 space-y-5" use:enhance>
			<label class="label">
				<span>Email</span>
				<input class="input" name="email" type="email" placeholder="john.doe@example.com" />
			</label>
			<label class="label">
				<span>Password</span>
				<input class="input" name="password" type="password" placeholder="" />
			</label>
			<button type="submit" class="btn variant-filled w-full">Sign In</button>
		</form>

		<footer class="card-footer">
			Do not have an account? <a href="register" class=" text-primary-500">Register</a>
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
