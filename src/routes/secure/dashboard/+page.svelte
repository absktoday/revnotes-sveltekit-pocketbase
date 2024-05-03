<script lang="ts">
	import { applyAction, deserialize, enhance } from '$app/forms';
	import type { PageData, SubmitFunction } from './$types';
	import Fa from 'svelte-fa';
	import { faTrash } from '@fortawesome/free-solid-svg-icons';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';

	const modalStore = getModalStore();

	export let data: PageData;

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		const action = event.currentTarget.action;

		const confirmModal: ModalSettings = {
			type: 'confirm',
			title: 'Please Confirm',
			body: 'Are you sure you wish to delete this note?',
			response: async (r: boolean) => {
				if (r) {
					const response = await fetch(action, {
						method: 'POST',
						body: data,
						headers: {
							'x-sveltekit-action': 'true'
						}
					});

					const result: ActionResult = deserialize(await response.text());

					if (result.type === 'success') {
						// rerun all `load` functions, following the successful update
						await invalidateAll();
					}

					applyAction(result);
				}
			}
		};

		modalStore.trigger(confirmModal);
	}
</script>

<div class="container mx-auto px-3 space-y-4">
	<form method="POST" action="?/addnote" class="card mt-10" use:enhance>
		<section class="p-4 space-y-4">
			<label class="label">
				<span>Title</span>
				<input name="title" class="input" type="text" placeholder="Optional" />
			</label>
			<label class="label">
				<span>Note</span>
				<textarea
					class="textarea"
					rows="4"
					placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
					name="content"
					required
				/>
			</label>
		</section>

		<footer class="card-footer">
			<button class="btn btn-sm variant-filled">Add Note</button>
		</footer>
	</form>
	<div class="flex justify-between items-center">
		<h4 class="h4">All Notes</h4>
	</div>

	{#each data.resultList as note}
		<div class="card card-hover">
			<section class="p-4">
				<div class="flex justify-between items-center">
					<div class="flex flex-col gap-4">
						{#if note.title}
							<h5 class="h5">
								{note.title}
							</h5>
						{/if}

						<p>{note.content}</p>
					</div>
					<div>
						<form method="POST" action="?/deletenote" on:submit|preventDefault={handleSubmit}>
							<input type="text" value={note.id} hidden name="id" />
							<button class="btn-icon variant-filled">
								<Fa icon={faTrash} />
							</button>
						</form>
					</div>
				</div>
			</section>
		</div>
	{:else}
		<p>No Notes!</p>
	{/each}
</div>
