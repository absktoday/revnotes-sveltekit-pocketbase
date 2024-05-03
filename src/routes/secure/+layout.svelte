<script>
	import { enhance } from '$app/forms';
	import { AppBar } from '@skeletonlabs/skeleton';
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<h3 class="h3">RevNotes</h3>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<form method="POST" action="/secure?/signout" use:enhance>
			<button class="btn variant-filled">Sign Out</button>
		</form>
	</svelte:fragment>
</AppBar>
<slot />
