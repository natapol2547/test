<script lang="ts">
	import "../app.css";
	import { auth, firestore, storage } from "$lib/firebase";
	import { FirebaseApp } from "sveltefire";
</script>

<FirebaseApp {auth} {firestore} {storage}>
	<slot />
</FirebaseApp>
