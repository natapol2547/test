<script lang="ts">
	import Navbar from "$lib/components/navbar/navbar.svelte";
</script>

<Navbar>
	<div class="drawer h-full lg:drawer-open">
		<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content max-h-full overflow-y-auto">
			<!-- Page content here -->
			<slot />
		</div>
		<div class="drawer-side h-full">
			<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"
			></label>
			<div class="h-full bg-base-200 text-base-content">
				<ul class="menu p-4 w-80">
					<!-- Sidebar content here -->
					<li><a>Sidebar Item 1</a></li>
					<li><a>Sidebar Item 2</a></li>
				</ul>
			</div>
		</div>
	</div>
</Navbar>
