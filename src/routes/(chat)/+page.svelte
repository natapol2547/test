<script lang="ts">
	import { useChat } from "ai/svelte";
	const { input, handleSubmit, messages } = useChat();
</script>

<section class="flex flex-col h-full">
	<ul class="flex-grow flex flex-col gap-2 px-2 pt-4">
		{#each $messages as message}
			<li class=" rounded-box p-4 outline outline-1">{message.role}: {message.content}</li>
		{/each}
	</ul>
	<form on:submit={handleSubmit} class="flex gap-2">
		<input bind:value={$input} class="input input-bordered w-full" />
		<button type="submit" class="btn btn-outline">Send</button>
	</form>
</section>