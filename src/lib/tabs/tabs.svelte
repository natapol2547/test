<script lang="ts">
    export let tabs:string[];
	export let activeTab = 0
</script>
<div class="tabs tabs-boxed w-fit">
	{#each tabs as tab, index}
	  <button class="tab tab-lifted font-bold" class:tab-active={activeTab == index} on:click={()=>activeTab = index}>{tab}</button>
	{/each}
</div>

<slot {activeTab} /> 