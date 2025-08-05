<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from './ui/button/button.svelte';
	import type { Row } from '@tanstack/table-core';
	import type { Client } from './clients-table.svelte';
	import { Ban } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { row }: { row: Row<Client> } = $props();

        console.log(row.original.id)

	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger
		class="hover:bg-accent hover:text-accent-foreground hover:bg-accent relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-start text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
		>Blochează clientul</Dialog.Trigger
	>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Blochează clientul</Dialog.Title>
			<Dialog.Description>
				Ești sigur că vrei să blochezi acest client? Acesta nu va mai putea face programări online.
			</Dialog.Description>
		</Dialog.Header>
		<form
			action="?/blockClient"
			method="POST"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success('Clientul a fost blocat cu succes.');
						await invalidateAll();
					} else {
						toast.error('Eroare:', {
							description: 'Clientul nu a putut fi blocat cu succes.'
						});
					}
				};
			}}
		>
			<input type="hidden" value={row.original.id} name="clientId" />
			<div class="flex justify-end">
				<Button type='submit' variant="destructive"><Ban /> Blochează clientul</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
